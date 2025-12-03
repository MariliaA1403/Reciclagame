const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST – Enviar avaliação
router.post("/add", async (req, res) => {
  try {
    const { jogador_id, referencia_id, tipo, nota, comentario } = req.body;

    if (!jogador_id || !referencia_id || !nota || !tipo) {
      return res.status(400).json({
        success: false,
        message: "Preencha todas as informações."
      });
    }

    // verifica se já existe avaliação do mesmo jogador
    const check = await pool.query(
      `SELECT * FROM avaliacoes 
       WHERE jogador_id = $1 AND referencia_id = $2 AND tipo = $3`,
      [jogador_id, referencia_id, tipo]
    );

    if (check.rows.length > 0) {
      // atualiza avaliação existente
      await pool.query(
        `UPDATE avaliacoes 
         SET nota = $1, comentario = $2, criado_em = NOW()
         WHERE jogador_id = $3 AND referencia_id = $4 AND tipo = $5`,
        [nota, comentario, jogador_id, referencia_id, tipo]
      );

      return res.json({
        success: true,
        message: "Avaliação atualizada com sucesso!"
      });
    }
    

    // insere nova avaliação
    await pool.query(
      `INSERT INTO avaliacoes (jogador_id, tipo, referencia_id, nota, comentario)
       VALUES ($1, $2, $3, $4, $5)`,
      [jogador_id, tipo, referencia_id, nota, comentario]
    );

    return res.json({
      success: true,
      message: "Avaliação enviada com sucesso!"
    });

  } catch (err) {
    console.log("Erro ao enviar avaliação:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno"
    });
  }
});

// GET – Avaliações de um jogador (para mostrar apenas os avaliados na página de favoritos)
router.get("/jogador/:jogadorId", async (req, res) => {
  const { jogadorId } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.*, d.titulo, d.imagem 
       FROM avaliacoes a
       JOIN desafios d ON d.id = a.referencia_id
       WHERE a.jogador_id = $1 AND a.tipo = 'desafio'`,
      [jogadorId]
    );

    res.json({ success: true, avaliacoes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao buscar avaliações" });
  }
});


module.exports = router;
