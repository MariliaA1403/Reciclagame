const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// ===============================
// LOGIN
// ===============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email e senha obrigatórios." });

  try {
    // ==== LOGIN COMO JOGADOR ====
    const jogadorQ = await pool.query(
      `SELECT * FROM jogadores WHERE email = $1 OR matricula = $1`,
      [email]
    );

    if (jogadorQ.rows.length > 0) {
      const user = jogadorQ.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.senha);
      if (!passwordMatch)
        return res.status(401).json({ success: false, message: "Senha incorreta." });

      return res.json({
        success: true,
        message: "Login realizado!",
        user: {
          id: user.id,
          nome: user.nome,
          tipo: "jogador",
          instituicao_id: user.instituicao_id || null,
          pontos: user.pontos,
          nivel: user.nivel,
          avatar_url: user.avatar_url
        }
      });
    }

    // ==== LOGIN COMO INSTITUIÇÃO ====
    const instQ = await pool.query(
      `SELECT * FROM instituicoes WHERE email = $1 OR cnpj = $1`,
      [email]
    );

    if (instQ.rows.length > 0) {
      const user = instQ.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.senha);
      if (!passwordMatch)
        return res.status(401).json({ success: false, message: "Senha incorreta." });

      return res.json({
        success: true,
        message: "Login realizado!",
        user: {
          id: user.id,
          nome: user.nome,
          tipo: "instituicao",
          logo_url: user.logo_url,
          status: user.status
        }
      });
    }

    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

// ===============================
// REGISTER
// ===============================
router.post('/register', async (req, res) => {
  const { tipo } = req.body;
  if (!tipo) return res.status(400).json({ success: false, message: "Tipo não informado." });

  try {
    //=========================
    // CADASTRO JOGADOR
    //=========================
    if (tipo === "jogador") {
      const { nome, matricula, data_nascimento, telefone, endereco,
              instituicao_id, email, senha } = req.body;

      if (!nome || !matricula || !data_nascimento || !telefone || !endereco || !email || !senha)
        return res.status(400).json({ success: false, message: "Campos incompletos para jogador." });

      // Verifica duplicidade
      const check = await pool.query(
        `SELECT id FROM jogadores WHERE email = $1 OR matricula = $2`,
        [email, matricula]
      );
      if (check.rows.length > 0)
        return res.status(400).json({ success: false, message: "Email ou matrícula já usados." });

      // Verifica instituição
      if (instituicao_id) {
        const instCheck = await pool.query(`SELECT id FROM instituicoes WHERE id = $1`, [instituicao_id]);
        if (instCheck.rows.length === 0)
          return res.status(400).json({ success: false, message: "Instituição não encontrada." });
      }

      // HASH DA SENHA
      const hashedPassword = await bcrypt.hash(senha, 10);

      const insert = await pool.query(
        `INSERT INTO jogadores 
         (nome, matricula, data_nascimento, telefone, endereco, instituicao_id, email, senha)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, nome, matricula, email, instituicao_id`,
        [nome, matricula, data_nascimento, telefone, endereco, instituicao_id || null, email, hashedPassword]
      );

      return res.json({
        success: true,
        message: "Jogador criado com sucesso!",
        user: { ...insert.rows[0], tipo: "jogador" }
      });
    }

    //=========================
    // CADASTRO INSTITUIÇÃO
    //=========================
    if (tipo === "instituicao") {
      const { nome, cnpj, email, telefone, endereco, senha } = req.body;

      if (!nome || !cnpj || !email || !telefone || !endereco || !senha)
        return res.status(400).json({ success: false, message: "Campos incompletos para instituição." });

      const check = await pool.query(
        `SELECT id FROM instituicoes WHERE email = $1 OR cnpj = $2`,
        [email, cnpj]
      );
      if (check.rows.length > 0)
        return res.status(400).json({ success: false, message: "Email ou CNPJ já usados." });

      // HASH DA SENHA
      const hashedPassword = await bcrypt.hash(senha, 10);

      const insert = await pool.query(
        `INSERT INTO instituicoes (nome, cnpj, email, telefone, endereco, senha)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, nome, cnpj, email`,
        [nome, cnpj, email, telefone, endereco, hashedPassword]
      );

      return res.json({
        success: true,
        message: "Instituição cadastrada com sucesso!",
        user: { ...insert.rows[0], tipo: "instituicao" }
      });
    }

    return res.status(400).json({ success: false, message: "Tipo inválido." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

module.exports = router;
