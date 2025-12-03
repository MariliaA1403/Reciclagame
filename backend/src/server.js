const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // conexão com PostgreSQL
const path = require('path');
const fs = require('fs');

const app = express();

// ============================
// MIDDLEWARES
// ============================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// Serve arquivos da pasta uploads (para avatars)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// ============================
// ROTAS TESTE
// ============================
app.get('/', (req, res) => res.send("ReciclaGame Backend!"));
app.get('/api/test', (req, res) => res.json({ message: "API funcionando!" }));

// ============================
// LOGIN
// ============================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email e senha obrigatórios." });

  try {
    const jogador = await pool.query(
      `SELECT * FROM jogadores WHERE email = $1 OR matricula = $1 OR telefone = $1`,
      [email]
    );

    if (jogador.rows.length > 0) {
      const user = jogador.rows[0];
      if (user.senha === password) {
        return res.json({ success: true, message: "Login realizado!", user: { ...user, tipo: "jogador" } });
      }
      return res.status(401).json({ success: false, message: "Senha incorreta." });
    }

    const instituicao = await pool.query(
      `SELECT * FROM instituicoes WHERE email = $1 OR cnpj = $1`,
      [email]
    );

    if (instituicao.rows.length > 0) {
      const user = instituicao.rows[0];
      if (user.senha === password) {
        return res.json({ success: true, message: "Login realizado!", user: { ...user, tipo: "instituicao" } });
      }
      return res.status(401).json({ success: false, message: "Senha incorreta." });
    }

    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

// ============================
// CADASTRO
// ============================
app.post('/api/register', async (req, res) => {
  const { tipo } = req.body;
  if (!tipo) return res.status(400).json({ success: false, message: "Tipo não informado." });

  try {
    if (tipo === "jogador") {
      const { nome, matricula, data_nascimento, telefone, endereco, instituicao_id, email, senha } = req.body;
      const emailCheck = await pool.query(`SELECT * FROM jogadores WHERE email = $1`, [email]);
      if (emailCheck.rows.length > 0) return res.status(400).json({ success: false, message: "Este e-mail já está em uso por outro jogador." });

      const result = await pool.query(
        `INSERT INTO jogadores (nome, matricula, data_nascimento, telefone, endereco, instituicao_id, email, senha)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [nome, matricula, data_nascimento, telefone, endereco, instituicao_id, email, senha]
      );

      return res.json({ success: true, message: "Jogador cadastrado com sucesso!", user: result.rows[0] });
    }

    if (tipo === "instituicao") {
      const { nome, cnpj, email, telefone, endereco, senha } = req.body;
      const emailCheck = await pool.query(`SELECT * FROM instituicoes WHERE email = $1`, [email]);
      if (emailCheck.rows.length > 0) return res.status(400).json({ success: false, message: "Este e-mail já está em uso por outra instituição." });

      const result = await pool.query(
        `INSERT INTO instituicoes (nome, cnpj, email, telefone, endereco, senha)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [nome, cnpj, email, telefone, endereco, senha]
      );

      return res.json({ success: true, message: "Instituição cadastrada com sucesso!", user: result.rows[0] });
    }

    return res.status(400).json({ success: false, message: "Tipo inválido." });

  } catch (error) {
    console.error(error);
    if (error.code === "23505") return res.status(400).json({ success: false, message: "Este e-mail já está cadastrado." });
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

// ============================
// IMPORTAR ROTAS
// ============================
const desafiosRoutes = require('./routes/desafios');
const quizzesRoutes = require('./routes/quizzes');
const instituicoesRoutes = require('./routes/instituicoes');
const jogadoresRoutes = require('./routes/jogadores');
const favoritosRoutes = require('./routes/favoritos');
const avaliacoesRoutes = require('./routes/avaliacoes');
const enviosRoutes = require('./routes/envios');
const uploadRoutes = require('./routes/uploads');

// ============================
// USAR ROTAS
// ============================
app.use('/api/desafios', desafiosRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/instituicoes', instituicoesRoutes);
app.use('/api/jogadores', jogadoresRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/envios', enviosRoutes);

// Rota de uploads (avatars)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api', uploadRoutes);


const chatRoutes = require("./routes/chat");
app.use("/chat", chatRoutes);


// ============================
// ROTAS DE RECUPERAÇÃO DE SENHA
// ============================
const recuperarSenhaRoutes = require('./routes/recuperarSenha');
app.use('/api/recuperar-senha', recuperarSenhaRoutes);


const trocarSenhaRoutes = require("./routes/trocarSenha");
app.use("/api/trocar-senha", trocarSenhaRoutes);

const uploadLogoRoutes = require("./routes/uploadLogo");
app.use("/api/upload-logo", uploadLogoRoutes);

// Para servir arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ============================
// INICIAR SERVIDOR
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
