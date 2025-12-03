// routes/uploadLogo.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");

// Criando diretório se não existir
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "instituicoes");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo_${req.params.id}${ext}`);
  },
});

const upload = multer({ storage });

// =====================
// UPLOAD LOGO
// =====================
router.post("/:id", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Arquivo não enviado." });

    const logoUrl = `/uploads/instituicoes/${req.file.filename}`;

    await pool.query("UPDATE instituicoes SET logo_url=$1 WHERE id=$2", [logoUrl, req.params.id]);

    return res.json({ success: true, logo_url: logoUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro ao enviar logo." });
  }
});

// =====================
// DELETE LOGO
// =====================
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT logo_url FROM instituicoes WHERE id=$1", [req.params.id]);
    if (!result.rows[0] || !result.rows[0].logo_url) {
      return res.status(404).json({ success: false, message: "Logo não encontrada." });
    }

    const filePath = path.join(__dirname, "..", result.rows[0].logo_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query("UPDATE instituicoes SET logo_url=NULL WHERE id=$1", [req.params.id]);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro ao remover logo." });
  }
});

module.exports = router;
