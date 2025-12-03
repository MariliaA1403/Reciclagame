import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const API_URL = "https://backend-reciclagame.vercel.app";

export default function AvaliarDesafio() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [favorito, setFavorito] = useState(false);

  const [showCard, setShowCard] = useState(false);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);

  // ======================================================
  // FUNÇÃO → BUSCAR USUÁRIO + PONTOS ATUALIZADOS (MESMA DAS OUTRAS TELAS)
  // ======================================================
  async function loadUserAndPontos() {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const userId = parsed.id;
    setUserId(userId);

    try {
      const userRes = await fetch(`${API_URL}/api/jogadores/${userId}`);
      const userData = await userRes.json();

      const pontosRes = await fetch(`${API_URL}/api/jogadores/${userId}/pontos-total`);
      const pontosData = await pontosRes.json();

      setUser({
        id: userId,
        nome: userData.nome || "Usuário",
        pontos: pontosData.success ? pontosData.totalFinal : 0,
        avatar_url: userData.avatar_url ? `${API_URL}${userData.avatar_url}` : null,
      });

      setAvatar(userData.avatar_url ? `${API_URL}${userData.avatar_url}` : null);

      buscarAvaliacaoExistente(userId);
      buscarFavoritoExistente(userId);

    } catch (err) {
      console.log("Erro ao carregar usuário:", err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUserAndPontos();
    }, [])
  );

  // ================================
  // Buscar avaliação existente
  // ================================
  const buscarAvaliacaoExistente = async (jogadorId) => {
    try {
      const res = await fetch(`${API_URL}/api/avaliacoes/get/${jogadorId}/${id}`);
      const data = await res.json();

      if (data.success && data.avaliacao) {
        setNota(data.avaliacao.nota);
        setComentario(data.avaliacao.comentario || "");
      }
    } catch (error) {
      console.log("Erro ao buscar avaliação:", error);
    }
  };

  // ================================
  // Buscar favorito
  // ================================
  const buscarFavoritoExistente = async (jogadorId) => {
    try {
      const res = await fetch(`${API_URL}/api/favoritos/${jogadorId}`);
      const data = await res.json();

      if (data.desafios?.some((d) => d.id == id)) setFavorito(true);
    } catch (error) {
      console.log("Erro ao buscar favorito:", error);
    }
  };

  // ================================
  // FAVORITAR / DESFAVORITAR
  // ================================
  const toggleFavorito = async () => {
    try {
      if (!favorito) {
        await fetch(`${API_URL}/api/favoritos/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jogador_id: userId, tipo: "desafio", item_id: id }),
        });
      } else {
        await fetch(`${API_URL}/api/favoritos/remove`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jogador_id: userId, tipo: "desafio", item_id: id }),
        });
      }

      setFavorito(!favorito);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar favoritos");
    }
  };

  // ================================
  // ENVIAR AVALIAÇÃO
  // ================================
  const enviarAvaliacao = async () => {
    if (nota === 0) return Alert.alert("Aviso", "Dê uma nota de 1 a 5.");

    try {
      const res = await fetch(`${API_URL}/api/avaliacoes/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogador_id: userId, tipo: "desafio", referencia_id: id, nota, comentario }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setShowCard(true);

    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a avaliação.");
    }
  };

  if (!user) return <Text>Carregando...</Text>;

  const Star = ({ filled, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Text style={filled ? styles.starFilled : styles.starEmpty}>★</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.userInfo} onPress={() => setSideMenuVisible(true)}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={60} color="#4CAF50" />
          )}

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.username}>{user.nome}</Text>
            <Text style={styles.pointsText}>{user.pontos} pontos</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity onPress={toggleFavorito} style={styles.favoriteBtn}>
          <Text style={styles.favoriteText}>
            {favorito ? "❤️ Favorito" : "🤍 Favoritar"}
          </Text>
        </TouchableOpacity>

        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} filled={n <= nota} onPress={() => setNota(n)} />
          ))}
        </View>

        <TextInput
          placeholder="Comentário (opcional)"
          value={comentario}
          onChangeText={setComentario}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={enviarAvaliacao}>
          <Text style={styles.buttonText}>Enviar Avaliação</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={showCard} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Parabéns!</Text>
            <Text style={styles.modalText}>Você avaliou o desafio com {nota} estrela(s).</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowCard(false);
                router.push("/favoritos");
              }}
            >
              <Text style={styles.modalButtonText}>Ir para Favoritos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {sideMenuVisible && <SideMenu router={router} onClose={() => setSideMenuVisible(false)} />}
    </View>
  );
}

// ===================== MENU =====================
const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={20} color="#000" />
    <Text style={{ marginLeft: 10, fontWeight: "bold", fontSize: 14 }}>{label}</Text>
  </TouchableOpacity>
);

const SideMenu = ({ onClose, router }) => (
  <View style={styles.menuOverlay}>
    <TouchableOpacity style={styles.menuBackground} onPress={onClose} />
    <View style={styles.sideMenu}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>

      <Text style={styles.menuTitle}>Menu de Atividades</Text>

      <MenuItem icon="home" label="Home" onPress={() => { router.push("/home"); onClose(); }} />
      <MenuItem icon="newspaper" label="Notícias" onPress={() => { router.push("/noticias"); onClose(); }} />
      <MenuItem icon="trophy" label="Desafios" onPress={() => { router.push("/desafios"); onClose(); }} />
      <MenuItem icon="logout" label="Sair" onPress={() => { router.push("/login"); onClose(); }} />
    </View>
  </View>
);

// ===================== ESTILOS =====================
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F7F5" },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 3,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: "#4CAF50" },

  username: { fontSize: 18, fontWeight: "bold" },
  pointsText: { marginTop: 4 },

  favoriteBtn: { alignSelf: "flex-end", marginBottom: 20 },
  favoriteText: { fontSize: 18 },

  starContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  starFilled: { fontSize: 40, color: "#FFD700", marginHorizontal: 5 },
  starEmpty: { fontSize: 40, color: "#ccc", marginHorizontal: 5 },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  button: {
    backgroundColor: "#FF8C00",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 12, alignItems: "center" },

  modalTitle: { fontSize: 22, fontWeight: "bold" },
  modalText: { fontSize: 16, marginVertical: 5 },

  modalButton: { backgroundColor: "#FF8C00", padding: 12, borderRadius: 8, marginTop: 10 },
  modalButtonText: { color: "#fff", fontWeight: "bold" },

  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  menuBackground: { flex: 1 },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFF",
    padding: 25,
    elevation: 10,
  },
  menuTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 22, color: "#278148" },
  closeButton: { position: "absolute", top: 12, right: 12 },
  closeText: { fontSize: 20, fontWeight: "bold", color: "#444" },
});
