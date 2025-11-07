const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("ReciclaGame Backend!");
});

app.get('/api/test', (req, res) => {
  res.json({ message: "API funcionando!" });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === "teste@reciclagame.com" && password === "123456") {
    return res.json({ success: true, message: "Login realizado com sucesso!" });
  }

  res.status(401).json({ success: false, message: "Email ou senha incorretos." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
