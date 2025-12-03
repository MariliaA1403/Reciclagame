// routes/trocarSenha.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Trocar senha
router.post("/", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) return res.status(400).json({ success: false, message: "Email e nova senha são obrigatórios." });

  try {
    // Tenta atualizar jogador
    const jogador = await pool.query(
      `UPDATE jogadores SET senha = $1 WHERE email = $2 OR matricula = $2 RETURNING *`,
      [senha, email]
    );
    if (jogador.rows.length > 0) {
      return res.json({ success: true, message: "Senha do jogador atualizada com sucesso!" });
    }

    // Tenta atualizar instituição
    const instituicao = await pool.query(
      `UPDATE instituicoes SET senha = $1 WHERE email = $2 OR cnpj = $2 RETURNING *`,
      [senha, email]
    );
    if (instituicao.rows.length > 0) {
      return res.json({ success: true, message: "Senha da instituição atualizada com sucesso!" });
    }

    return res.status(404).json({ success: false, message: "Email não encontrado." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

module.exports = router;
