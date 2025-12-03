// routes/recuperarSenha.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Verificar se email está cadastrado
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email obrigatório." });

  try {
    // Verifica jogador
    const jogador = await pool.query(
      `SELECT * FROM jogadores WHERE email = $1 OR matricula = $1`,
      [email]
    );
    if (jogador.rows.length > 0) {
      return res.json({ success: true, tipo: "jogador" });
    }

    // Verifica instituição
    const instituicao = await pool.query(
      `SELECT * FROM instituicoes WHERE email = $1 OR cnpj = $1`,
      [email]
    );
    if (instituicao.rows.length > 0) {
      return res.json({ success: true, tipo: "instituicao" });
    }

    return res.status(404).json({ success: false, message: "Email não encontrado." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

module.exports = router;
