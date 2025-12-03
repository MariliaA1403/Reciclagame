// routes/desafios.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // arquivo de conexão com o banco

// ===========================
// Listar desafios de um jogador
// GET /api/desafios?jogadorId=1
// ===========================
router.get("/", async (req, res) => {
  const jogadorId = req.query.jogadorId;

  if (!jogadorId) {
    return res.status(400).json({ success: false, message: "ID do jogador é obrigatório" });
  }

  try {
    // Busca todos os desafios cadastrados
    const desafiosRes = await pool.query("SELECT * FROM desafios ORDER BY id ASC");
    const desafios = desafiosRes.rows;

    // Busca desafios concluídos pelo jogador
    const concluidosRes = await pool.query(
      "SELECT desafio_id FROM jogador_desafios WHERE jogador_id=$1 AND concluido=TRUE",
      [jogadorId]
    );
    const concluidosIds = concluidosRes.rows.map(r => r.desafio_id);

    // Calcula pontos totais
    const pontosRes = await pool.query(
      "SELECT SUM(pontos_ganhos) AS pontos FROM jogador_desafios WHERE jogador_id=$1 AND concluido=TRUE",
      [jogadorId]
    );
    const pontos = pontosRes.rows[0].pontos || 0;

    // Formata desafios para o frontend
    const desafiosFormatados = desafios.map(d => ({
      id: d.id,
      titulo: d.titulo,
      descricao: d.descricao,
      pontos: d.pontos,
      imagem: d.imagem,
      concluido: concluidosIds.includes(d.id),
    }));

    res.json({
      success: true,
      desafios: desafiosFormatados,
      userPoints: pontos,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao buscar desafios" });
  }
});

// ===========================
// Concluir desafio (VERSÃO NOVA, 100% CERTA)
// ===========================
router.post("/concluir", async (req, res) => {
  const { userId, desafioId } = req.body;

  if (!userId || !desafioId) {
    return res.status(400).json({ success: false, message: "userId e desafioId são obrigatórios" });
  }

  try {
    // Marca como concluído (ou ignora se já existir)
    await pool.query(
      `INSERT INTO jogador_desafios (jogador_id, desafio_id, concluido, pontos_ganhos)
       VALUES ($1, $2, TRUE, (SELECT pontos FROM desafios WHERE id=$2))
       ON CONFLICT (jogador_id, desafio_id) DO NOTHING`,
      [userId, desafioId]
    );

    // Quantos desafios o jogador completou
    const concluidosRes = await pool.query(
      "SELECT COUNT(*) AS total FROM jogador_desafios WHERE jogador_id=$1 AND concluido=TRUE",
      [userId]
    );
    const concluidos = parseInt(concluidosRes.rows[0].total);

    // Quantos desafios existem no sistema
    const totalRes = await pool.query("SELECT COUNT(*) AS total FROM desafios");
    const totalDesafios = parseInt(totalRes.rows[0].total);

    // Calcula progresso em porcentagem REAL
    const progresso = totalDesafios > 0
      ? Math.floor((concluidos / totalDesafios) * 100)
      : 0;

    // Soma pontos
    const pontosRes = await pool.query(
      "SELECT SUM(pontos_ganhos) AS pontos FROM jogador_desafios WHERE jogador_id=$1",
      [userId]
    );
    const pontos = pontosRes.rows[0].pontos || 0;

    // Atualiza jogador
    await pool.query(
      "UPDATE jogadores SET pontos=$1, levelprogress=$2 WHERE id=$3",
      [pontos, progresso, userId]
    );

    res.json({
      success: true,
      pontos,
      progresso
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao concluir desafio" });
  }
});

module.exports = router;
