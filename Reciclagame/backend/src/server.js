const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// MIDDLEWARES
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// ---------- ROTAS BÁSICAS ----------
app.get('/', (req, res) => {
  res.send("ReciclaGame Backend!");
});

app.get('/api/test', (req, res) => {
  res.json({ message: "API funcionando!" });
});

// ---------- LOGIN (FAKE) ----------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === "teste@reciclagame.com" && password === "123456") {
    return res.json({ success: true, message: "Login realizado com sucesso!" });
  }

  return res
    .status(401)
    .json({ success: false, message: "Email ou senha incorretos." });
});

// ---------- CADASTRO DE USUÁRIO ----------
app.post('/api/register', (req, res) => {
  const { tipo } = req.body;

  if (!tipo) {
    return res
      .status(400)
      .json({ success: false, message: "Tipo não informado." });
  }

  // --- CADASTRO DE JOGADOR ---
  if (tipo === "jogador") {
    const {
      nome,
      matricula,
      data_nascimento,
      telefone,
      endereco,
      instituicao,
      senha,
    } = req.body;

    console.log("Novo jogador cadastrado:");
    console.log(req.body);

    return res.json({
      success: true,
      message: "Jogador cadastrado com sucesso!",
    });
  }

  // --- CADASTRO DE INSTITUIÇÃO ---
  if (tipo === "instituicao") {
    const { nome, cnpj, email, telefone, endereco, senha } = req.body;

    console.log("Nova instituição cadastrada:");
    console.log(req.body);

    return res.json({
      success: true,
      message: "Instituição cadastrada com sucesso!",
    });
  }

  // --- TIPO INVÁLIDO ---
  return res
    .status(400)
    .json({ success: false, message: "Tipo inválido." });
});

// ---------- INICIAR SERVIDOR ----------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
