// app/api.js

const API_URL = "https://backend-reciclagame.vercel.app";

// Buscar dados do usuário por ID
export async function fetchUserById(id) {
  const res = await fetch(`${API_URL}/api/jogador/${id}`);
  return res.json();
}

// Atualizar nome, email, nível, pontos etc.
export async function updateUser(payload) {
  const res = await fetch(`${API_URL}/api/update-user`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Atualizar a foto de avatar
export async function updateAvatar(payload) {
  const res = await fetch(`${API_URL}/api/update-avatar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
