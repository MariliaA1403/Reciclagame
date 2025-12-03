const express = require("express");
const router = express.Router();
const pool = require("../db");

// ============================================================
// GET → Buscar mensagens de uma instituição (inclui mensagens dos jogadores)
// ============================================================
router.get("/:instituicaoId", async (req, res) => {
  const { instituicaoId } = req.params;

  try {
    const result = await pool.query(`
      SELECT m.*, 
             j.nome AS nome_jogador, 
             i.nome AS nome_instituicao
      FROM mensagens_chat m
      LEFT JOIN jogadores j ON m.jogador_id = j.id
      LEFT JOIN instituicoes i ON m.instituicao_id = i.id
      WHERE m.instituicao_id = $1 OR m.jogador_id IN (
        SELECT id FROM jogadores WHERE instituicao_id = $1
      )
      ORDER BY m.criado_em ASC
    `, [instituicaoId]);

    res.json({ success: true, mensagens: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao buscar mensagens" });
  }
});

// ============================================================
// POST → Enviar mensagem
// ============================================================
router.post("/enviar", async (req, res) => {
  const { jogador_id, instituicao_id, mensagem, enviado_por } = req.body;

  if (!mensagem) return res.status(400).json({ success: false, message: "Mensagem vazia" });

  try {
    const result = await pool.query(
      `INSERT INTO mensagens_chat (jogador_id, instituicao_id, mensagem, enviado_por)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        jogador_id || null,
        instituicao_id || null,
        mensagem,
        enviado_por
      ]
    );
    res.json({ success: true, mensagem: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao enviar mensagem" });
  }
});

// ============================================================
// PUT → Editar mensagem
// ============================================================
router.put("/editar/:id", async (req, res) => {
  const { id } = req.params;
  const { mensagem } = req.body;

  if (!mensagem) return res.status(400).json({ success: false, message: "Mensagem vazia" });

  try {
    await pool.query(`UPDATE mensagens_chat SET mensagem = $1 WHERE id = $2`, [mensagem, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao editar mensagem" });
  }
});

// ============================================================
// DELETE → Excluir mensagem
// ============================================================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM mensagens_chat WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao excluir mensagem" });
  }
});

module.exports = router;
