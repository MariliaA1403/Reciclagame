const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // seu db.js com a Pool do pg

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// ROTAS
app.get('/', (req, res) => {
  res.send("ReciclaGame Backend!");
});

app.get('/api/test', (req, res) => {
  res.json({ message: "API funcionando!" });
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email e senha obrigatórios." });
  }

  try {
    // Procurar jogador
    const jogador = await pool.query(
      `SELECT * FROM jogadores WHERE email = $1 OR matricula = $1 OR telefone = $1`,
      [email]
    );

    if (jogador.rows.length > 0) {
      const user = jogador.rows[0];
      if (user.senha === password) {
        return res.json({ success: true, message: "Login realizado!", user: { id: user.id, nome: user.nome, tipo: 'jogador' } });
      } else {
        return res.status(401).json({ success: false, message: "Senha incorreta." });
      }
    }

    // Procurar instituição
    const instituicao = await pool.query(
      `SELECT * FROM instituicoes WHERE email = $1 OR cnpj = $1`,
      [email]
    );

    if (instituicao.rows.length > 0) {
      const user = instituicao.rows[0];
      if (user.senha === password) {
        return res.json({ success: true, message: "Login realizado!", user: { id: user.id, nome: user.nome, tipo: 'instituicao' } });
      } else {
        return res.status(401).json({ success: false, message: "Senha incorreta." });
      }
    }

    // Se não encontrou
    return res.status(404).json({ success: false, message: "Usuário não encontrado." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

// CADASTRO
app.post('/api/register', async (req, res) => {
  const { tipo } = req.body;

  if (!tipo) return res.status(400).json({ success: false, message: "Tipo não informado." });

  try {
    if (tipo === "jogador") {
      const { nome, matricula, data_nascimento, telefone, endereco, instituicao, email, senha } = req.body;

      const result = await pool.query(
        `INSERT INTO jogadores (nome, matricula, data_nascimento, telefone, endereco, instituicao, email, senha)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [nome, matricula, data_nascimento, telefone, endereco, instituicao, email, senha]
      );

      return res.json({ success: true, message: "Jogador cadastrado com sucesso!", jogador: result.rows[0] });
    }

    if (tipo === "instituicao") {
      const { nome, cnpj, email, telefone, endereco, senha } = req.body;

      const result = await pool.query(
        `INSERT INTO instituicoes (nome, cnpj, email, telefone, endereco, senha)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [nome, cnpj, email, telefone, endereco, senha]
      );

      return res.json({ success: true, message: "Instituição cadastrada com sucesso!", instituicao: result.rows[0] });
    }

    return res.status(400).json({ success: false, message: "Tipo inválido." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
