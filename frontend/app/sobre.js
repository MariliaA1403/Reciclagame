import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const API_URL = "http://localhost:3000";

export default function Sobre() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // ======================================================
  // FUNÇÃO → BUSCAR USUÁRIO + PONTOS ATUALIZADOS
  // ======================================================
  async function loadUserAndPontos() {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const userId = parsed.id;

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
    } catch (err) {
      console.log("Erro ao carregar usuário:", err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUserAndPontos();
    }, [])
  );

  if (!user) return <Text>Carregando...</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* ====== HEADER ====== */}
      <LinearGradient
        colors={["#C9DFC9", "#95C296"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => setMenuVisible(true)}
        >
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons
              name="account-circle"
              size={70}
              color="#fff"
            />
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.username}>{user.nome}</Text>
            <Text style={styles.pointsText}>{user.pontos} pontos</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* ====== CONTEÚDO ====== */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Sobre o ReciclaGame</Text>

        <Text style={styles.text}>
          O ReciclaGame é um aplicativo educativo que incentiva práticas de
          reciclagem e conscientização ambiental de forma divertida e
          interativa. Através de quizzes, desafios e atividades, os usuários
          aprendem sobre sustentabilidade e acumulam pontos por cada ação
          correta.
        </Text>

        <Text style={styles.text}>
          Nosso objetivo é engajar crianças, adolescentes e adultos, tornando
          o aprendizado sobre reciclagem motivador. Instituições e escolas
          podem acompanhar o desempenho dos participantes e criar competições
          saudáveis.
        </Text>

        <Text style={styles.text}>
          A missão do ReciclaGame é transformar conhecimento em ação, mostrando
          que pequenas atitudes podem gerar grandes impactos para o meio
          ambiente.
        </Text>
      </ScrollView>

      {/* ====== MENU LATERAL ====== */}
      {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuBackground}
            onPress={() => setMenuVisible(false)}
          />
          <View style={styles.sideMenu}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.menuTitle}>Menu</Text>

            <MenuItem
              icon="home"
              label="Home"
              onPress={() => {
                router.push("/home");
                setMenuVisible(false);
              }}
            />
            <MenuItem
              icon="information"
              label="Sobre"
              onPress={() => setMenuVisible(false)}
            />
            <MenuItem
              icon="trophy"
              label="Desafios"
              onPress={() => {
                router.push("/desafios");
                setMenuVisible(false);
              }}
            />
            <MenuItem
              icon="logout"
              label="Sair"
              onPress={() => {
                router.push("/login");
                setMenuVisible(false);
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ================= MENU ITEM =================
const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity
    style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}
    onPress={onPress}
  >
    <MaterialCommunityIcons name={icon} size={22} color="#262927ff" />
    <Text style={{ marginLeft: 12, fontWeight: "bold", fontSize: 16 }}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ================= ESTILOS =================
const styles = StyleSheet.create({
  header: {
    height: 150,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  username: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  pointsText: { color: "#fff", marginTop: 4 },

  content: { padding: 25 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#278148",
    marginBottom: 25,
    textAlign: "center",
  },
  text: { fontSize: 16, color: "#555", marginBottom: 18, lineHeight: 24 },

  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  menuBackground: { flex: 1 },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  menuTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 22, color: "#278148" },
  closeButton: { position: "absolute", top: 12, right: 12, padding: 6 },
  closeText: { fontSize: 20, fontWeight: "bold", color: "#444" },
});
