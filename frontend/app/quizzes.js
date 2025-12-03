// app/quizzes.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://localhost:3000";
const GRADIENT_COLORS = ["#C9DFC9", "#95C296"];

export default function QuizzesScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ id: null, nome: "Usuário", pontos: 0, avatar_url: null });
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [quizzes, setQuizzes] = useState([
    { title: "Notícia Limpa", color: "#B6F7C1", pontos: 10 },
    { title: "Planeta em Jogo", color: "#A9D1FF", pontos: 15 },
    { title: "Cidade Sustentável", color: "#FFE28A", pontos: 20 },
    { title: "Ciência Verde", color: "#8BE39A", pontos: 25 },
  ]);

  // ================================
  // FUNÇÃO PARA CARREGAR USUÁRIO + PONTOS
  // ================================
  async function loadUserAndPontos() {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    const parsed = JSON.parse(raw);

    try {
      // Buscar pontuação atualizada do banco
      const pontosRes = await fetch(`${API_URL}/api/jogadores/${parsed.id}/pontos-total`);
      const pontosData = await pontosRes.json();

      setUser({
        id: parsed.id,
        nome: parsed.nome || parsed.name,
        pontos: pontosData.success ? pontosData.totalFinal : parsed.pontos || 0,
        avatar_url: parsed.avatar_url || null,
      });
    } catch (err) {
      console.log("Erro ao buscar pontos:", err);
    }
  }

  // ================================
  // CARREGAR AO MONTAR
  // ================================
  useEffect(() => {
    loadUserAndPontos();
  }, []);

  // ================================
  // ATUALIZAR SEMPRE QUE VOLTAR PARA ESSA TELA
  // ================================
  useFocusEffect(
    useCallback(() => {
      loadUserAndPontos();
    }, [])
  );

  // ================================
  // ABRIR QUIZ
  // ================================
  function openQuiz(quiz) {
    if (!user.id) {
      alert("Erro: jogador não encontrado!");
      return;
    }

    const slug = quiz.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();

    router.push(`/quiz/${slug}?jogador_id=${user.id}`);
  }

  // ================================
  // UPLOAD DE AVATAR
  // ================================
  const changeAvatar = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert("Precisamos acessar suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    const uri = Platform.OS === "ios" ? result.assets[0].uri.replace("file://", "") : result.assets[0].uri;

    const formData = new FormData();
    formData.append("avatar", { uri, name: `avatar_${Date.now()}.jpg`, type: "image/jpeg" });

    try {
      const res = await fetch(`${API_URL}/upload-avatar/${user.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const updatedUser = { ...user, avatar_url: data.avatar_url };
        setUser(updatedUser);
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Avatar atualizado!");
      } else {
        alert(data.message || "Erro ao atualizar avatar.");
      }
    } catch (err) {
      console.log(err);
      alert("Erro ao enviar avatar.");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={GRADIENT_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
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

      {/* LISTA DE QUIZZES */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {quizzes.map((quiz, index) => (
          <TouchableOpacity key={index} style={[styles.quizCard, { backgroundColor: quiz.color }]} onPress={() => openQuiz(quiz)}>
            <Text style={styles.cardTitle}>{quiz.title}</Text>
            <MaterialIcons name="chevron-right" size={28} color="#000" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MENU LATERAL */}
      {sideMenuVisible && <SideMenu router={router} onClose={() => setSideMenuVisible(false)} />}
    </View>
  );
}

// =============== MENU LATERAL ===============
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

// =============== ESTILOS ===============
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F5" },
  scroll: { padding: 20, paddingBottom: 40 },

  // HEADER
  header: {
    height: 140,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  username: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  pointsText: { color: "#fff", marginTop: 4 },

  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    marginBottom: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#000" },

  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  menuBackground: { flex: 1 },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFF",
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
