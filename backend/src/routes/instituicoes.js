// routes/instituicoes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===============================
// Configuração do Multer para upload de logo
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "instituicoes");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `instituicao_${req.params.id}${ext}`);
  },
});

const upload = multer({ storage });

// ===============================
// GET todas (id + nome)
// ===============================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nome 
      FROM instituicoes 
      ORDER BY nome ASC
    `);
    return res.json({ success: true, instituicoes: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro ao buscar instituições." });
  }
});

// ===============================
// GET por ID
// ===============================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT id, nome, cnpj, email, telefone, endereco, logo_url, status, data_cadastro
      FROM instituicoes 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Instituição não encontrada." });

    return res.json({ success: true, instituicao: result.rows[0] });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro ao buscar instituição." });
  }
});

// ===============================
// CREATE instituição
// ===============================
router.post('/', async (req, res) => {
  const { nome, cnpj, email, telefone, endereco, senha, logo_url } = req.body;

  if (!nome || !cnpj || !email || !telefone || !endereco || !senha)
    return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });

  try {
    // Duplicidade
    const dup = await pool.query(`
      SELECT id FROM instituicoes 
      WHERE email = $1 OR cnpj = $2
    `, [email, cnpj]);

    if (dup.rows.length > 0)
      return res.status(400).json({ success: false, message: "E-mail ou CNPJ já cadastrado." });

    const hashed = await bcrypt.hash(senha, 10);

    const result = await pool.query(`
      INSERT INTO instituicoes 
      (nome, cnpj, email, telefone, endereco, senha, logo_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, nome, cnpj, email, telefone, endereco, logo_url, status, data_cadastro
    `, [nome, cnpj, email, telefone, endereco, hashed, logo_url || null]);

    return res.json({ success: true, message: "Instituição cadastrada com sucesso!", instituicao: result.rows[0] });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro ao cadastrar instituição." });
  }
});

// ===============================
// UPDATE instituição
// ===============================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, email, telefone, endereco, senha, logo_url, status } = req.body;

  if (!nome || !cnpj || !email || !telefone || !endereco)
    return res.status(400).json({ success: false, message: "Campos obrigatórios faltando." });

  try {
    // Checa duplicidade em outro ID
    const dup = await pool.query(`
      SELECT id FROM instituicoes 
      WHERE (email = $1 OR cnpj = $2) AND id <> $3
    `, [email, cnpj, id]);

    if (dup.rows.length > 0)
      return res.status(400).json({ success: false, message: "E-mail ou CNPJ já em uso por outra instituição." });

    let hashed = null;
    if (senha) hashed = await bcrypt.hash(senha, 10);

    const result = await pool.query(`
      UPDATE instituicoes
      SET nome = $1,
          cnpj = $2,
          email = $3,
          telefone = $4,
          endereco = $5,
          senha = COALESCE($6, senha),
          logo_url = $7,
          status = CASE WHEN $8 = '' THEN status ELSE COALESCE($8, status) END
      WHERE id = $9
      RETURNING id, nome, cnpj, email, telefone, endereco, logo_url, status
    `,
      [nome, cnpj, email, telefone, endereco, hashed, logo_url || null, status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Instituição não encontrada." });

    return res.json({ success: true, message: "Instituição atualizada!", instituicao: result.rows[0] });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar instituição." });
  }
});

// ===============================
// DELETE instituição
// ===============================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      DELETE FROM instituicoes 
      WHERE id = $1 
      RETURNING id
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Instituição não encontrada." });

    return res.json({ success: true, message: "Instituição deletada com sucesso!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro ao deletar instituição." });
  }
});

// ===============================
// UPLOAD de foto de perfil (logo_url)
// ===============================
router.post("/:id/foto", upload.single("foto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Nenhuma foto enviada." });

    const logoUrl = `/uploads/instituicoes/${req.file.filename}`;

    const result = await pool.query(
      "UPDATE instituicoes SET logo_url = $1 WHERE id = $2 RETURNING id, nome, logo_url",
      [logoUrl, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Instituição não encontrada." });

    res.json({ success: true, message: "Foto atualizada com sucesso!", logo_url: logoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao atualizar foto." });
  }
});

module.exports = router;
