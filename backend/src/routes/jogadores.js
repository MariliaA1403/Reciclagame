// routes/jogadores.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// ============================================================
// GET – Pontuação TOTAL (Desafios + Quizzes)
// ============================================================
router.get("/:id/pontos-total", async (req, res) => {
  const { id } = req.params;

  try {
    const desafiosRes = await pool.query(
      `SELECT COALESCE(SUM(pontos_ganhos), 0) AS total_desafios
       FROM jogador_desafios
       WHERE jogador_id = $1 AND concluido = TRUE`,
      [id]
    );

    const quizzesRes = await pool.query(
      `SELECT COALESCE(SUM(score), 0) AS total_quizzes
       FROM jogador_quiz
       WHERE jogador_id = $1`,
      [id]
    );

    return res.json({
      success: true,
      totalDesafios: parseInt(desafiosRes.rows[0].total_desafios, 10),
      totalQuizzes: parseInt(quizzesRes.rows[0].total_quizzes, 10),
      totalFinal:
        parseInt(desafiosRes.rows[0].total_desafios, 10) +
        parseInt(quizzesRes.rows[0].total_quizzes, 10),
    });
  } catch (err) {
    console.error("Erro ao calcular pontos totais:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao calcular pontos totais.",
    });
  }
});

// ============================================================
// GET – Verifica tentativas do jogador em um quiz
// ============================================================
router.get("/:jogador_id/quiz/:quiz_slug", async (req, res) => {
  const { jogador_id, quiz_slug } = req.params;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS attempts
       FROM jogador_quiz
       WHERE jogador_id = $1 AND quiz_slug = $2`,
      [jogador_id, quiz_slug]
    );

    return res.json({ attempts: parseInt(result.rows[0].attempts, 10) });
  } catch (err) {
    console.error("Erro ao buscar tentativas:", err);
    return res.status(500).json({ error: "Erro ao buscar tentativas." });
  }
});

// ============================================================
// GET – Avaliações concluídas (Desafios + Quizzes)
// ============================================================
router.get("/:id/avaliacoes", async (req, res) => {
  const { id } = req.params;

  try {
    const desafios = await pool.query(
      `SELECT 
         jd.id,
         d.titulo,
         d.imagem,
         jd.pontos_ganhos AS pontos,
         'desafio' AS tipo
       FROM jogador_desafios jd
       JOIN desafios d ON d.id = jd.desafio_id
       WHERE jd.jogador_id = $1 AND jd.concluido = TRUE`,
      [id]
    );

    const quizzes = await pool.query(
      `SELECT 
         jq.id,
         q.title AS titulo,
         q.imagem,
         jq.score AS pontos,
         'quiz' AS tipo
       FROM jogador_quiz jq
       JOIN quizzes q ON q.slug = jq.quiz_slug
       WHERE jq.jogador_id = $1`,
      [id]
    );

    return res.json({
      success: true,
      items: [...desafios.rows, ...quizzes.rows],
    });
  } catch (err) {
    console.error("Erro avaliações:", err);
    return res.status(500).json({ error: "Erro ao buscar avaliações." });
  }
});

// ============================================================
// GET – Jogadores por Instituição
// ============================================================
router.get("/instituicao/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const totalDesafiosRes = await pool.query("SELECT COUNT(*) AS total FROM desafios");
    const totalDesafios = parseInt(totalDesafiosRes.rows[0].total, 10);

    const result = await pool.query(
      `SELECT 
         j.id,
         j.nome,
         j.matricula,
         j.pontos,
         j.nivel,
         j.avatar_url,
         j.levelprogress,
         j.email,
         COALESCE(
           (SELECT COUNT(*) 
            FROM jogador_desafios jd 
            WHERE jd.jogador_id = j.id AND jd.concluido = TRUE), 0
         ) AS concluidos
       FROM jogadores j
       WHERE j.instituicao_id = $1
       ORDER BY j.nome`,
      [id]
    );

    const jogadores = result.rows.map(j => {
      const pendentes = totalDesafios - j.concluidos;
      let statusDesafio = "Não iniciado";
      if (j.concluidos > 0 && pendentes > 0) statusDesafio = "Em andamento";
      else if (pendentes === 0 && totalDesafios > 0) statusDesafio = "Concluído";

      return {
        ...j,
        pendentes,
        statusDesafio,
        totalDesafios,
      };
    });

    return res.json({ success: true, jogadores });
  } catch (err) {
    console.error("Erro rota instituicao:", err);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao buscar jogadores da instituição." });
  }
});

// ============================================================
// POST – Criar jogador (hash da senha)
// ============================================================
router.post("/", async (req, res) => {
  const { nome, matricula, senha, instituicao_id, email, data_nascimento, telefone, endereco } = req.body;

  if (!nome || !matricula || !senha || !email) {
    return res.status(400).json({ success: false, message: "Campos obrigatórios faltando." });
  }

  try {
    // verifica duplicidade por email ou matrícula
    const dup = await pool.query(
      `SELECT id FROM jogadores WHERE email = $1 OR matricula = $2`,
      [email, matricula]
    );

    if (dup.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email ou matrícula já cadastrados." });
    }

    const hashed = await bcrypt.hash(senha, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO jogadores (nome, matricula, senha, instituicao_id, email, data_nascimento, telefone, endereco)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, nome, matricula, email, instituicao_id, pontos, nivel, avatar_url`,
      [nome, matricula, hashed, instituicao_id || null, email, data_nascimento || null, telefone || null, endereco || null]
    );

    const jogador = result.rows[0];
    return res.status(201).json({ success: true, jogador });
  } catch (err) {
    console.error("Erro ao criar jogador:", err);
    return res.status(500).json({ success: false, message: "Erro ao criar jogador." });
  }
});

// ============================================================
// POST – Somar pontos manualmente
// ============================================================
router.post("/:id/add-pontos", async (req, res) => {
  const { id } = req.params;
  const { pontos } = req.body;

  if (!pontos || pontos <= 0) {
    return res.status(400).json({ error: "Pontos inválidos." });
  }

  try {
    const result = await pool.query(
      `UPDATE jogadores
       SET pontos = pontos + $1
       WHERE id = $2
       RETURNING id, nome, pontos`,
      [pontos, id]
    );

    return res.json({ success: true, jogador: result.rows[0] });
  } catch (err) {
    console.error("Erro ao adicionar pontos:", err);
    return res.status(500).json({ error: "Erro ao adicionar pontos." });
  }
});

// ============================================================
// PUT – Atualizar jogador (hash senha se for alterada)
// ============================================================
router.put("/:id", async (req, res) => {
  const { nome, senha, pontos, nivel, levelprogress, avatar_url, email, telefone, endereco } = req.body;
  const id = req.params.id;

  try {
    // se veio senha, hash
    let hashed = null;
    if (senha) hashed = await bcrypt.hash(senha, SALT_ROUNDS);

    const result = await pool.query(
      `UPDATE jogadores
       SET nome = COALESCE($1, nome),
           senha = COALESCE($2, senha),
           pontos = COALESCE($3, pontos),
           nivel = COALESCE($4, nivel),
           levelprogress = COALESCE($5, levelprogress),
           avatar_url = COALESCE($6, avatar_url),
           email = COALESCE($7, email),
           telefone = COALESCE($8, telefone),
           endereco = COALESCE($9, endereco)
       WHERE id = $10
       RETURNING id, nome, matricula, email, instituicao_id, pontos, nivel, levelprogress, avatar_url, telefone, endereco`,
      [nome, hashed, pontos, nivel, levelprogress, avatar_url, email, telefone, endereco, id]
    );

    return res.json({ success: true, jogador: result.rows[0] });
  } catch (err) {
    console.error("Erro ao atualizar jogador:", err);
    return res.status(500).json({ error: "Erro ao atualizar jogador." });
  }
});

// ============================================================
// DELETE – Excluir jogador
// ============================================================
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM jogadores WHERE id = $1", [req.params.id]);
    return res.json({ message: "Jogador excluído com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir jogador:", err);
    return res.status(500).json({ error: "Erro ao excluir jogador." });
  }
});

// ============================================================
// GET – Todos os jogadores (não retorna senha)
// ============================================================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, matricula, email, pontos, nivel, avatar_url, instituicao_id 
       FROM jogadores ORDER BY id ASC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar jogadores:", err);
    return res.status(500).json({ error: "Erro ao buscar jogadores." });
  }
});

// ============================================================
// GET – Jogador por ID (RETORNA SEM SENHA)
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, matricula, email, data_nascimento, telefone, endereco, pontos, nivel, avatar_url, instituicao_id 
       FROM jogadores WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Jogador não encontrado." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar jogador:", err);
    return res.status(500).json({ error: "Erro ao buscar jogador." });
  }
});

// ============================================================
// GET – Todos os desafios de um jogador (concluídos e pendentes)
// ============================================================
router.get("/:id/desafios", async (req, res) => {
  const { id } = req.params;

  try {
    const desafiosRes = await pool.query(`SELECT * FROM desafios ORDER BY id`);
    const concluidosRes = await pool.query(
      `SELECT desafio_id FROM jogador_desafios WHERE jogador_id = $1 AND concluido = TRUE`,
      [id]
    );

    const concluidosIds = concluidosRes.rows.map(j => j.desafio_id);
    const desafios = desafiosRes.rows.map(d => ({
      ...d,
      status: concluidosIds.includes(d.id) ? "Concluído" : "Pendente",
    }));

    const quizzesRes = await pool.query(
      `SELECT q.slug AS quiz_slug, q.title, q.points_total, jq.attempt AS attempt, jq.score
       FROM jogador_quiz jq
       JOIN quizzes q ON q.slug = jq.quiz_slug
       WHERE jq.jogador_id = $1
       ORDER BY jq.criado_em DESC`,
      [id]
    );

    return res.json({ success: true, desafios, quizzes: quizzesRes.rows });
  } catch (err) {
    console.error("Erro ao buscar desafios do jogador:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar desafios do jogador." });
  }
});

module.exports = router;
