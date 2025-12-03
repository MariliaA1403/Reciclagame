const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================
// Configuração do Multer para envios
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "envios");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// =======================================
// POST – Jogador envia participação (texto + fotos)
// =======================================
router.post("/desafios/participar", upload.array("fotos", 5), async (req, res) => {
  try {
    const { jogador_id, desafio_id, descricao } = req.body;

    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILES:", req.files);

    if (!jogador_id || !desafio_id || (!descricao && (!req.files || req.files.length === 0))) {
      return res.status(400).json({ success: false, message: "Envie foto ou texto." });
    }

    const fotosCaminho = req.files ? req.files.map(file => `/uploads/envios/${file.filename}`) : [];
    const tipo = fotosCaminho.length > 0 ? (descricao ? "foto e texto" : "foto") : "texto";

    const result = await pool.query(
      `INSERT INTO envios_desafios (jogador_id, desafio_id, tipo, foto, texto)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [jogador_id, desafio_id, tipo, fotosCaminho.join(","), descricao]
    );

    res.json({
      success: true,
      envio: result.rows[0],
      message: "Participação enviada! Aguarde a avaliação da instituição.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao enviar participação." });
  }
});

// =======================================
// GET – Pegar envios pendentes de uma instituição
// =======================================
router.get("/pendentes/:instituicao_id", async (req, res) => {
  try {
    const { instituicao_id } = req.params;

    const result = await pool.query(
      `SELECT ed.id, ed.jogador_id, ed.desafio_id, ed.tipo, ed.foto, ed.texto, ed.status, ed.criado_em,
              j.nome AS jogador_nome, d.titulo AS desafio_titulo, d.pontos AS desafio_pontos
       FROM envios_desafios ed
       JOIN desafios d ON d.id = ed.desafio_id
       JOIN jogadores j ON j.id = ed.jogador_id
       WHERE j.instituicao_id = $1 AND ed.status = 'pendente'
       ORDER BY ed.criado_em ASC`,
      [instituicao_id]
    );

    res.json({ success: true, envios: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao buscar envios." });
  }
});

// =======================================
// PUT – Avaliar envio (aprovar ou reprovar)
// =======================================
router.put("/avaliar/:envio_id", async (req, res) => {
  try {
    const { envio_id } = req.params;
    const { acao } = req.body;

    if (!acao || !["aprovado", "reprovado"].includes(acao)) {
      return res.status(400).json({ success: false, message: "Ação inválida." });
    }

    const result = await pool.query(
      `UPDATE envios_desafios SET status=$1 WHERE id=$2 RETURNING *`,
      [acao, envio_id]
    );

    const envio = result.rows[0];
    if (!envio) return res.status(404).json({ success: false, message: "Envio não encontrado." });

    if (acao === "aprovado") {
      const pontosRes = await pool.query(`SELECT pontos FROM desafios WHERE id=$1`, [envio.desafio_id]);
      const pontos = pontosRes.rows[0].pontos;

      await pool.query(
        `UPDATE jogadores SET pontos = COALESCE(pontos, 0) + $1 WHERE id=$2`,
        [pontos, envio.jogador_id]
      );

      await pool.query(
        `INSERT INTO jogador_desafios (jogador_id, desafio_id, concluido, pontos_ganhos)
         VALUES ($1, $2, TRUE, $3)
         ON CONFLICT (jogador_id, desafio_id)
         DO UPDATE SET concluido = TRUE, pontos_ganhos = EXCLUDED.pontos_ganhos`,
        [envio.jogador_id, envio.desafio_id, pontos]
      );

      const concluidosRes = await pool.query(
        `SELECT COUNT(*) AS total FROM jogador_desafios WHERE jogador_id=$1 AND concluido=TRUE`,
        [envio.jogador_id]
      );
      const totalConcluidos = parseInt(concluidosRes.rows[0].total);

      const totalDesafiosRes = await pool.query(`SELECT COUNT(*) AS total FROM desafios`);
      const totalDesafios = parseInt(totalDesafiosRes.rows[0].total);

      const progresso = totalDesafios > 0 ? Math.floor((totalConcluidos / totalDesafios) * 100) : 0;

      await pool.query(`UPDATE jogadores SET levelprogress=$1 WHERE id=$2`, [progresso, envio.jogador_id]);
    }

    res.json({ success: true, envio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao avaliar envio." });
  }
});

// =======================================
// GET – Verificar se jogador já enviou participação de um desafio
// =======================================
router.get("/status/:desafio_id/:jogador_id", async (req, res) => {
  try {
    const { desafio_id, jogador_id } = req.params;

    const result = await pool.query(
      `SELECT id, status 
       FROM envios_desafios 
       WHERE jogador_id=$1 AND desafio_id=$2`,
      [jogador_id, desafio_id]
    );

    res.json({ success: true, envio: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao verificar envio." });
  }
});

module.exports = router;
