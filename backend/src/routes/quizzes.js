const express = require('express');
const router = express.Router();
const pool = require('../db');


// ------------------------------------------------------
// GET – Lista todos os quizzes
// ------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quizzes ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao buscar quizzes" });
  }
});


// ------------------------------------------------------
// GET – Perguntas do quiz por slug
// ------------------------------------------------------
router.get('/:slug/questions', async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM perguntas_quiz WHERE quiz_slug = $1 ORDER BY id',
      [slug]
    );

    const questions = result.rows.map(p => ({
      id: p.id,
      question: p.pergunta,
      options: [p.opcao_a, p.opcao_b, p.opcao_c, p.opcao_d],
      answer: p.resposta_correta,
      points: p.pontos || 5
    }));

    res.json({ questions });

  } catch (err) {
    console.error("Erro ao buscar perguntas:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar perguntas" });
  }
});



// ------------------------------------------------------------
// POST – Envia respostas, salva tentativa e atualiza melhor score
// ------------------------------------------------------------
router.post('/:slug/submit', async (req, res) => {
  const { slug } = req.params;
  const { jogador_id, respostas } = req.body;

  if (!jogador_id) {
    return res.status(400).json({
      success: false,
      message: "ID do jogador não fornecido"
    });
  }

  try {
    // 1) Carrega perguntas do quiz
    const perguntasResult = await pool.query(
      'SELECT * FROM perguntas_quiz WHERE quiz_slug = $1 ORDER BY id',
      [slug]
    );

    const perguntas = perguntasResult.rows;

    // 2) Calcula score
    let totalScore = 0;

    perguntas.forEach((p, idx) => {
      if (respostas[idx] === p.resposta_correta) {
        totalScore += p.pontos || 5;
      }
    });


    // 3) Verifica tentativas do jogador
    const tentativasResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM tentativas 
      WHERE jogador_id = $1 
      AND quiz_id = (SELECT id FROM quizzes WHERE slug = $2)
      `,
      [jogador_id, slug]
    );

    const attempts = Number(tentativasResult.rows[0].count);

    if (attempts >= 2) {
      return res.status(400).json({
        success: false,
        message: "Você já atingiu o limite de 2 tentativas."
      });
    }

    const attemptNumber = attempts + 1;


    // 4) Salva tentativa no histórico
    await pool.query(
      `
      INSERT INTO tentativas (jogador_id, quiz_id, pontos)
      VALUES ($1, (SELECT id FROM quizzes WHERE slug = $2), $3)
      `,
      [jogador_id, slug, totalScore]
    );


    // 5) Verifica melhor score do jogador no quiz
    const bestResult = await pool.query(
      `
      SELECT score FROM jogador_quiz
      WHERE jogador_id = $1 AND quiz_slug = $2
      ORDER BY score DESC
      LIMIT 1
      `,
      [jogador_id, slug]
    );


    if (bestResult.rows.length === 0) {
      // Primeira participação → cria registro
      await pool.query(
        `
        INSERT INTO jogador_quiz (jogador_id, quiz_slug, score, attempt)
        VALUES ($1, $2, $3, $4)
        `,
        [jogador_id, slug, totalScore, attemptNumber]
      );
    } else {
      const bestScore = bestResult.rows[0].score;

      // Atualiza somente se o jogador fizer uma pontuação maior
      if (totalScore > bestScore) {
        await pool.query(
          `
          UPDATE jogador_quiz
          SET score = $1, attempt = $2
          WHERE jogador_id = $3 AND quiz_slug = $4
          `,
          [totalScore, attemptNumber, jogador_id, slug]
        );
      }
    }


    // 6) Recalcula pontos total do jogador (somando melhores scores)
    await pool.query(`
      UPDATE jogadores
      SET pontos_quiz = (
        SELECT COALESCE(SUM(score), 0)
        FROM jogador_quiz
        WHERE jogador_id = $1
      )
      WHERE id = $1
    `, [jogador_id]);



    // 7) Retorna resposta ao app
    res.json({
      success: true,
      score: totalScore,
      attempt: attemptNumber
    });

  } catch (err) {
    console.error("Erro ao salvar quiz:", err);
    res.status(500).json({ success: false, message: "Erro ao salvar quiz." });
  }
});



// ------------------------------------------------------------
// GET – Verificar tentativas do jogador para um quiz
// ------------------------------------------------------------
router.get('/:jogador_id/quiz/:slug', async (req, res) => {
  const { jogador_id, slug } = req.params;

  if (!jogador_id) {
    return res.status(400).json({
      success: false,
      message: "ID do jogador inválido",
      attempts: 0
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT COUNT(*) 
      FROM tentativas
      WHERE jogador_id = $1
      AND quiz_id = (SELECT id FROM quizzes WHERE slug = $2)
      `,
      [jogador_id, slug]
    );

    const attempts = Number(result.rows[0].count);

    res.json({ attempts });

  } catch (err) {
    console.error("Erro ao buscar tentativas do jogador:", err);
    res.status(500).json({ attempts: 0 });
  }
});

module.exports = router;
