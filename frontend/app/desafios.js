// app/desafios.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

const API_URL = "http://localhost:3000";
const GRADIENT_COLORS = ["#C9DFC9", "#95C296"];
const screenWidth = Dimensions.get("window").width;

export default function DesafiosScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ id: null, name: "Usuário", pontos: 0, levelProgress: 0, avatar_url: null });
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

// ==========================
// Função para carregar usuário + pontos atualizados
// ==========================
async function loadUserAndPontos() {
  const raw = await AsyncStorage.getItem("user");
  if (!raw) return;

  const parsed = JSON.parse(raw);
  const userId = parsed.id;

  try {
    // Buscar dados do jogador
    const userRes = await fetch(`${API_URL}/api/jogadores/${userId}`);
    const userData = await userRes.json();

    // Buscar pontos atualizados
    const pontosRes = await fetch(`${API_URL}/api/jogadores/${userId}/pontos-total`);
    const pontosData = await pontosRes.json();

    setUser({
      id: userId,
      name: userData.nome || "Usuário",
      pontos: pontosData.success ? pontosData.totalFinal : 0,
      avatar_url: userData.avatar_url
        ? `${API_URL}${userData.avatar_url}`
        : null,
    });
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

useFocusEffect(
  useCallback(() => {
    loadUserAndPontos();
  }, [])
);

  // ==========================
  // Carregar desafios
  // ==========================
  useEffect(() => {
    if (!user.id) return;

    async function loadDesafios() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/desafios?jogadorId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          const novos = data.desafios.map(d => ({ ...d, concluido: d.concluido }));
          setDesafios(novos);
          // Atualiza progresso
          setUser(prev => ({ ...prev, levelProgress: calculateProgress(novos) }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDesafios();
  }, [user.id]);

  // ==========================
  // Funções auxiliares
  // ==========================
  function calculateProgress(lista) {
    const total = lista.length || 1;
    const concluido = lista.filter(d => d.concluido).length;
    return (concluido / total) * 100;
  }

  async function handleConcluir(desafio) {
    if (desafio.concluido) return;

    try {
      const res = await fetch(`${API_URL}/api/desafios/concluir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, desafioId: desafio.id })
      });
      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erro", data.message || "Não foi possível concluir o desafio");
        return;
      }

      // Atualiza desafios localmente
      const novosDesafios = desafios.map(d => (d.id === desafio.id ? { ...d, concluido: true } : d));
      setDesafios(novosDesafios);

      // Atualiza pontos e progresso
      const updatedUser = {
        ...user,
        pontos: data.pontosAtualizados,
        levelProgress: calculateProgress(novosDesafios)
      };
      setUser(updatedUser);

      // Salva no AsyncStorage para manter sincronizado com outras telas
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Parabéns!", `Você concluiu o desafio e agora tem ${data.pontosAtualizados} pontos!`);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao concluir desafio");
    }
  }

  const getImage = (imgName) => {
    switch(imgName) {
      case "desafio1.png": return require("../assets/images/desafio1.png");
      case "desafio2.png": return require("../assets/images/desafio2.png");
      case "desafio3.png": return require("../assets/images/desafio3.png");
      case "desafio4.png": return require("../assets/images/desafio4.png");
      case "desafio5.png": return require("../assets/images/desafio5.png");
      case "desafio6.png": return require("../assets/images/desafio6.png");
      default: return null;
    }
  };

  if (loading) return <Text style={{ textAlign: "center", marginTop: 50 }}>Carregando...</Text>;
  if (desafios.length === 0) return <Text style={{ textAlign: "center", marginTop: 50 }}>Nenhum desafio disponível no momento.</Text>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => setProfileMenuVisible(true)}>
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.headerAvatar} />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={60} color="#fff" />
              )}
            </TouchableOpacity>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.username}>{user.name}</Text>
              <Text style={styles.pointsText}>{user.pontos} pontos</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${user.levelProgress}%` }]} />
                </View>
                <Text style={styles.progressPercentage}>{Math.round(user.levelProgress)}%</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => setSideMenuVisible(true)}>
            <MaterialCommunityIcons name="menu" size={28} color="#242222ff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Lista de desafios */}
        <Text style={styles.title}>Desafios Disponíveis</Text>
        {desafios.map(d => (
          <View key={d.id} style={styles.desafioCard}>
            <Text style={styles.desafioTitle}>{d.titulo}</Text>
            {d.imagem && <Image source={getImage(d.imagem)} style={styles.desafioImage} />}
            <Text style={{ marginTop: 5 }}>{d.descricao.replace(/\\n/g, '\n')}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 5 }}>{d.pontos} pontos</Text>
            {!d.concluido ? (
              <TouchableOpacity style={styles.btnConcluir} onPress={() => handleConcluir(d)}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Marcar como concluído</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ fontWeight: "bold", color: "green", marginTop: 5 }}>Concluído</Text>
            )}
          </View>
        ))}
      </ScrollView>

      {sideMenuVisible && <SideMenu router={router} onClose={() => setSideMenuVisible(false)} />}
      {profileMenuVisible && <ProfileMenu router={router} onClose={() => setProfileMenuVisible(false)} />}
    </View>
  );
}

// ==============================
// COMPONENTES DE MENU
// ==============================
const MenuItem = ({ icon, label, subtitle, onPress, color }) => (
  <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={20} color={color || "#000"} />
    <View style={{ marginLeft: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: "bold", color: color || "#000" }}>{label}</Text>
      {subtitle && <Text style={{ fontSize: 10, color: "#555" }}>{subtitle}</Text>}
    </View>
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
      <MenuItem icon="chat" label="Chat com a turma" onPress={() => { router.push("/chat"); onClose(); }} />
      <MenuItem icon="newspaper" label="Feed de Notícias" onPress={() => { router.push("/noticias"); onClose(); }} />
      <MenuItem icon="logout" label="Sair" color="#ff1a1a" onPress={() => { router.push("/login"); onClose(); }} />
    </View>
  </View>
);

const ProfileMenu = ({ onClose, router }) => (
  <View style={styles.menuOverlay}>
    <TouchableOpacity style={styles.menuBackground} onPress={onClose} />
    <View style={styles.sideMenu}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
      <Text style={styles.menuTitle}>Configurações e Atividade</Text>
      <MenuItem icon="account" label="Central de contas" subtitle="Senhas, segurança e dados pessoais" onPress={() => { router.push("/central-conta"); onClose(); }} />
      <MenuItem icon="star" label="Favoritos" onPress={() => { router.push("/favoritos"); onClose(); }} />
      <MenuItem icon="alert-circle" label="Sobre" onPress={() => { router.push("/sobre"); onClose(); }} />
      <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: "bold" }}>Entrar:</Text>
      <MenuItem icon="account-plus" label="Adicionar Conta" onPress={() => { router.push("/adicionar-conta"); onClose(); }} />
      <MenuItem icon="logout" label="Sair" color="#ff1a1a" onPress={() => { router.push("/login"); onClose(); }} />
    </View>
  </View>
);

// ==============================
// ESTILOS
// ==============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FCFDFD" },
  scrollContent: { padding: 20 },

  header: {
    height: 140,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 6,
    elevation: 6,
  },

  headerContent: { flexDirection: "row", alignItems: "center" },

  headerAvatar: { width: 60, height: 60, borderRadius: 30 },

  username: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  pointsText: { color: "#fff", marginTop: 4 },

  progressBarContainer: { marginTop: 8 },
  progressBarBackground: {
    height: 16,
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#CBF9E0",
    borderRadius: 10,
  },
  progressPercentage: {
    marginTop: 4,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "right",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#278148",
  },
desafioCard: {
  backgroundColor: "#E0F7E0",
  padding: 25,          // mais espaço interno
  borderRadius: 14,
  marginBottom: 20,
  minHeight: 450,       // card bem alto
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
},

cardTitle: {
  fontSize: 20,          // título maior
  fontWeight: "bold",
  marginBottom: 8,
},
cardDescription: {
  fontSize: 16,          // descrição maior
  color: "#333",
},

  desafioTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 4 },

  btnConcluir: {
    backgroundColor: "#278148",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 6,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },

  desafioImage: { width: "100%", height: 420, marginTop: 6, borderRadius: 6 },

  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },

  menuBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },

  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  menuTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },

  closeButton: { position: "absolute", top: 10, right: 10, zIndex: 1, padding: 5 },
  closeText: { fontSize: 18, fontWeight: "bold", color: "#555" },
});
