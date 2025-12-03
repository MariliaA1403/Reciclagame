const pool = require('../db');

// ===============================
// PEGAR TODOS OS QUIZZES
// ===============================
exports.getAllQuizzes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM quizzes ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao buscar quizzes" });
  }
};

// ===============================
// PEGAR QUIZ POR SLUG
// ===============================
exports.getQuizBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      "SELECT * FROM quizzes WHERE slug = $1 LIMIT 1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz não encontrado"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar quiz:", error);
    res.status(500).json({ success: false, message: "Erro interno ao buscar quiz" });
  }
};



// =============================================================
// SALVAR PONTUAÇÃO — SÓ ATUALIZA SE FOR MAIOR + MÁX 2 TENTATIVAS
// =============================================================
exports.saveScore = async (req, res) => {
  try {
    const { jogadorId, quizSlug, score } = req.body;

    if (!jogadorId || !quizSlug || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios não enviados."
      });
    }

    // 🔹 1) Verificar quantas tentativas o jogador já tem
    const tentativasResult = await pool.query(
      "SELECT COUNT(*) FROM tentativas WHERE jogador_id = $1 AND quiz_id = (SELECT id FROM quizzes WHERE slug = $2)",
      [jogadorId, quizSlug]
    );

    const tentativas = Number(tentativasResult.rows[0].count);

    if (tentativas >= 2) {
      return res.json({
        success: false,
        message: "Você já atingiu o limite de 2 tentativas."
      });
    }

    // 🔹 2) Inserir nova tentativa (tabela tentativas)
    await pool.query(
      `
      INSERT INTO tentativas (jogador_id, quiz_id, pontos)
      VALUES ($1, (SELECT id FROM quizzes WHERE slug = $2), $3)
      `,
      [jogadorId, quizSlug, score]
    );

    const attemptNumber = tentativas + 1;

    // 🔹 3) Verificar se já existe registro na tabela jogador_quiz
    const existing = await pool.query(
      `
      SELECT * FROM jogador_quiz
      WHERE jogador_id = $1 AND quiz_slug = $2
      ORDER BY score DESC
      LIMIT 1
      `,
      [jogadorId, quizSlug]
    );

    if (existing.rows.length === 0) {
      // Primeiro registro (primeira tentativa)
      await pool.query(
        `
        INSERT INTO jogador_quiz (jogador_id, quiz_slug, score, attempt)
        VALUES ($1, $2, $3, $4)
        `,
        [jogadorId, quizSlug, score, attemptNumber]
      );
    } else {
      const bestScore = existing.rows[0].score;

      // Atualiza apenas se for maior
      if (score > bestScore) {
        await pool.query(
          `
          UPDATE jogador_quiz
          SET score = $1, attempt = $2
          WHERE jogador_id = $3 AND quiz_slug = $4
          `,
          [score, attemptNumber, jogadorId, quizSlug]
        );
      }
    }

    res.json({
      success: true,
      message: "Pontuação salva!",
      attempt: attemptNumber
    });

  } catch (error) {
    console.error("Erro ao salvar pontuação:", error);
    res.status(500).json({ success: false, message: "Erro ao salvar pontuação" });
  }
};
