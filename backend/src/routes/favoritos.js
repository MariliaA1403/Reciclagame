const express = require("express");
const router = express.Router();
const pool = require("../db");

// ===============================================
// POST – Favoritar (desafio ou quiz)
// ===============================================
router.post("/add", async (req, res) => {
  try {
    const { jogador_id, tipo, item_id } = req.body;

    if (!jogador_id || !tipo || !item_id) {
      return res.status(400).json({
        success: false,
        message: "Dados incompletos"
      });
    }

    // Verifica se já está favoritado
    const check = await pool.query(
      `SELECT * FROM favoritos 
       WHERE jogador_id = $1 AND tipo = $2 AND item_id = $3`,
      [jogador_id, tipo, item_id]
    );

    if (check.rows.length > 0) {
      return res.json({ success: true, message: "Já está nos favoritos" });
    }

    // Insere favorito
    await pool.query(
      `INSERT INTO favoritos (jogador_id, tipo, item_id) 
       VALUES ($1, $2, $3)`,
      [jogador_id, tipo, item_id]
    );

    res.json({ success: true, message: "Favorito adicionado" });

  } catch (err) {
    console.error("Erro ao favoritar:", err);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// ===============================================
// DELETE – Remover favorito
// ===============================================
router.delete("/remove", async (req, res) => {
  try {
    const { jogador_id, tipo, item_id } = req.body;

    await pool.query(
      `DELETE FROM favoritos 
       WHERE jogador_id = $1 AND tipo = $2 AND item_id = $3`,
      [jogador_id, tipo, item_id]
    );

    res.json({ success: true, message: "Favorito removido" });

  } catch (err) {
    console.error("Erro ao remover favorito:", err);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// ===============================================
// GET – Listar favoritos do jogador (com avaliações)
// ===============================================
router.get("/:jogador_id", async (req, res) => {
  try {
    const { jogador_id } = req.params;

    // Buscar favoritos
    const result = await pool.query(
      `SELECT * FROM favoritos 
       WHERE jogador_id = $1
       ORDER BY criado_em DESC`,
      [jogador_id]
    );

    const favoritos = result.rows;

    let desafios = [];
    let quizzes = [];

    // Buscar detalhes de cada item e avaliações
    for (const fav of favoritos) {
      if (fav.tipo === "desafio") {
        const d = await pool.query(
          `SELECT 
             d.id, 
             d.titulo, 
             d.descricao, 
             d.imagem, 
             d.pontos,
             a.nota AS avaliacao_nota,
             a.comentario AS avaliacao_comentario
           FROM desafios d
           LEFT JOIN avaliacoes a 
             ON a.referencia_id = d.id 
             AND a.jogador_id = $1
             AND a.tipo = 'desafio'
           WHERE d.id = $2`,
          [jogador_id, fav.item_id]
        );
        if (d.rows.length > 0) desafios.push(d.rows[0]);
      }

      if (fav.tipo === "quiz") {
        const q = await pool.query(
          `SELECT 
             q.id, 
             q.slug, 
             q.title, 
             q.description, 
             q.points_total,
             a.nota AS avaliacao_nota,
             a.comentario AS avaliacao_comentario
           FROM quizzes q
           LEFT JOIN avaliacoes a 
             ON a.referencia_id = q.id 
             AND a.jogador_id = $1
             AND a.tipo = 'quiz'
           WHERE q.id = $2`,
          [jogador_id, fav.item_id]
        );
        if (q.rows.length > 0) quizzes.push(q.rows[0]);
      }
    }

    return res.json({
      success: true,
      desafios,
      quizzes
    });

  } catch (err) {
    console.error("Erro ao carregar favoritos:", err);
    return res.status(500).json({ success: false, message: "Erro interno" });
  }
});

module.exports = router;
