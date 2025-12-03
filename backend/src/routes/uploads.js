const express = require("express");
const router = express.Router();
const multer = require("multer");
const pool = require("../db");
const path = require("path");
const fs = require("fs");

// Configuração do storage do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.params.id}_${Date.now()}${ext}`);
  },
});

// Filtro para aceitar somente imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) cb(null, true);
  else cb(new Error("Apenas imagens (jpeg, jpg, png) são permitidas"));
};

const upload = multer({ storage, fileFilter });

// ============================================================
// POST – Upload avatar de jogador
// ============================================================
router.post("/upload-avatar/:id", upload.single("avatar"), async (req, res) => {
  try {
    const jogadorId = req.params.id;

    if (!req.file)
      return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Atualiza avatar no banco
    const result = await pool.query(
      "UPDATE jogadores SET avatar_url=$1 WHERE id=$2 RETURNING id, nome, avatar_url",
      [avatarUrl, jogadorId]
    );

    return res.json({ success: true, avatar_url: avatarUrl, jogador: result.rows[0] });
  } catch (err) {
    console.error("Erro no upload de avatar:", err);
    return res.status(500).json({ success: false, message: "Erro ao enviar avatar." });
  }
});

module.exports = router;
