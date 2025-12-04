import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const API = "https://backend-reciclagame.vercel.app/api/quizzes";
const API_URL = "https://backend-reciclagame.vercel.app";

export default function QuizStartScreen() {
  const router = useRouter();
  const { quiz, jogador_id } = useLocalSearchParams();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ id: null, nome: "Usuário", pontos: 0, avatar_url: null });
  const [sideMenuVisible, setSideMenuVisible] = useState(false);

  // -----------------------------------------
  // FUNÇÃO → CARREGAR USUÁRIO + PONTOS ATUALIZADOS
  // -----------------------------------------
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
        avatar_url: userData.avatar_url || null,
      });
    } catch (err) {
      console.error("Erro ao carregar usuário e pontos:", err);
    }
  }

  // -----------------------------------------
  // ATUALIZA QUANDO A TELA GANHA FOCO
  // -----------------------------------------
  useFocusEffect(
    useCallback(() => {
      loadUserAndPontos();
    }, [])
  );

  // -----------------------------------------
  // CARREGAR QUIZ
  // -----------------------------------------
  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(API);
        const data = await res.json();
        const selectedQuiz = data.find(q => q.slug === quiz);
        setQuizData(selectedQuiz);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quiz]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#278148" />;
  if (!quizData) return <Text style={styles.title}>Quiz não encontrado 😥</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <LinearGradient
        colors={["#C9DFC9", "#95C296"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.userInfo} onPress={() => setSideMenuVisible(true)}>
          {user.avatar_url ? (
            <Image source={{ uri: `${API_URL}${user.avatar_url}` }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={60} color="#fff" />
          )}

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.username}>{user.nome}</Text>
            <Text style={styles.pointsText}>{user.pontos} pontos</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* CONTEÚDO */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>{quizData.title}</Text>

          {/* INFO */}
          <View style={styles.infoContainer}>
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="format-list-numbered" size={28} color="#278148" />
              <Text style={styles.infoNumber}>{quizData.num_questions}</Text>
              <Text style={styles.infoLabel}>Perguntas</Text>
            </View>

            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="star" size={28} color="#FFD700" />
              <Text style={styles.infoNumber}>{quizData.points_total}</Text>
              <Text style={styles.infoLabel}>Pontos</Text>
            </View>
          </View>

          {/* BOTÃO */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push(`/quiz/play/${quiz}?jogador_id=${jogador_id}&api_url=${API}`)}
          >
            <LinearGradient colors={["#278148", "#1F7B3E"]} style={styles.gradientButton}>
              <Text style={styles.startText}>Começar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MENU LATERAL */}
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

// ================================================
const styles = StyleSheet.create({
  header: {
    height: 160,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    // SOMBRA
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Android
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  username: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  pointsText: { color: "#fff", marginTop: 4 },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: -50, // sobreposição do card sobre o header
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  title: { fontSize: 28, fontWeight: "bold", color: "#278148", marginBottom: 25, textAlign: "center" },

  infoContainer: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 30 },
  infoBox: { alignItems: "center" },
  infoNumber: { fontSize: 22, fontWeight: "bold", color: "#278148", marginVertical: 4 },
  infoLabel: { fontSize: 14, color: "#555" },

  startButton: { width: "100%", borderRadius: 30, overflow: "hidden" },
  gradientButton: { paddingVertical: 18, alignItems: "center", borderRadius: 30 },
  startText: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  menuBackground: { flex: 1 },
  sideMenu: { position: "absolute", top: 0, bottom: 0, width: 280, backgroundColor: "#FFF", padding: 25 },
  menuTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 22, color: "#278148" },
  closeButton: { position: "absolute", top: 12, right: 12, padding: 6 },
  closeText: { fontSize: 20, fontWeight: "bold", color: "#444" },
});
