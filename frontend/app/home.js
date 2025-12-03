// =================== Home.js ===================
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, JockeyOne_400Regular } from "@expo-google-fonts/jockey-one";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const GRADIENT_COLORS = ["#C9DFC9", "#95C296"];

export default function HomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ JockeyOne_400Regular });
  const [user, setUser] = useState({ id: null, nome: "Usuário", pontos: 0, levelProgress: 0, avatar_url: null });
  const [desafios, setDesafios] = useState([]);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = "https://backend-reciclagame.vercel.app";
  const [chartWidth, setChartWidth] = useState(Dimensions.get("window").width - 40);

  // ====== RESIZE ======
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setChartWidth(window.width - 40);
    });
    return () => subscription?.remove();
  }, []);

  
  // ====== LOAD USER E PONTOS ======
useEffect(() => {
  async function loadUserAndPontos() {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const userId = parsed.id;

    try {
      // 1️⃣ Buscar dados do jogador
      const userRes = await fetch(`${API_URL}/api/jogadores/${userId}`);
      const userData = await userRes.json();

      // 2️⃣ Buscar pontos totais (desafios + quizzes)
      const pontosRes = await fetch(`${API_URL}/api/jogadores/${userId}/pontos-total`);
      const pontosData = await pontosRes.json();

      setUser({
        id: userId,
        nome: userData.nome || "Usuário",
        pontos: pontosData.success ? pontosData.totalFinal : 0,
        levelProgress: 0, // calcularemos depois com desafios
        avatar_url: userData.avatar_url || null,
      });
    } catch (err) {
      console.error("Erro ao carregar usuário e pontos:", err);
    }
  }

  loadUserAndPontos();
}, []);


  // ====== LOAD DESAFIOS ======
  useEffect(() => {
    if (!user.id) return;

    async function loadDesafios() {
      try {
        const response = await fetch(`${API_URL}/api/desafios?jogadorId=${user.id}`);
        const data = await response.json();
        if (data.success) {
          const desafiosAtualizados = data.desafios.map(d => ({ ...d, concluido: d.concluido }));
          setDesafios(desafiosAtualizados);

         setUser(prev => ({
  ...prev,
  levelProgress: calculateProgress(desafiosAtualizados)
}));

        }
      } catch (err) {
        console.error("Erro ao carregar desafios:", err);
      }
    }

    loadDesafios();
    const interval = setInterval(loadDesafios, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  if (!fontsLoaded) return null;

  // ====== FUNÇÃO DE PROGRESSO ======
  function calculateProgress(listaDesafios) {
    const total = listaDesafios.length || 1;
    const concluido = listaDesafios.filter(d => d.concluido).length;
    return (concluido / total) * 100;
  }

  // ====== CONCLUIR DESAFIO ======
  async function handleConcluirDesafio(desafio) {
    if (isSubmitting || desafio.concluido) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/desafios/concluir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, desafioId: desafio.id }),
      });
      const data = await response.json();
      if (!data.success) {
        Alert.alert("Erro", data.message || "Não foi possível concluir o desafio");
        setIsSubmitting(false);
        return;
      }

      const novosDesafios = desafios.map(d => (d.id === desafio.id ? { ...d, concluido: true } : d));
      setDesafios(novosDesafios);

      setUser(prev => ({
        ...prev,
        pontos: data.pontosAtualizados,
        levelProgress: calculateProgress(novosDesafios),
      }));

    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao concluir desafio");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ====== UPLOAD AVATAR (continuará na Central-Conta) ======
  const changeAvatar = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permissão necessária", "Precisamos acessar suas fotos.");
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
      const res = await fetch(`${API_URL}/upload-avatar/${user.id}`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, avatar_url: data.avatar_url };
        setUser(updatedUser);
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        Alert.alert("Sucesso", "Avatar atualizado!");
      } else {
        Alert.alert("Erro", data.message || "Erro ao atualizar avatar.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Erro ao enviar avatar.");
    }
  };

  const concluidoCount = desafios.filter(d => d.concluido).length;
  const pendenteCount = desafios.filter(d => !d.concluido).length;

  const barChartData = {
    labels: ["Concluído", "Pendente", "Não iniciado"],
    datasets: [{ data: [concluidoCount, pendenteCount, 0] }],
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => setProfileMenuVisible(true)}>
              {user.avatar_url ? (
                <Image source={{ uri: `${API_URL}${user.avatar_url}` }} style={styles.avatar} />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={60} color="#fff" />
              )}
            </TouchableOpacity>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.username}>{user.nome}</Text>
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

        {/* ====== CARDS ====== */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pontos</Text>
            <Text style={styles.cardValue}>{user.pontos}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progresso</Text>
            <Text style={styles.cardValue}>{Math.round(user.levelProgress)}%</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Desafios Concluídos</Text>
            <Text style={styles.cardValue}>{concluidoCount}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Desafios Pendentes</Text>
            <Text style={styles.cardValue}>{pendenteCount}</Text>
          </View>
        </View>


{/* ====== BOTÕES DE DESAFIOS E QUIZZES ====== */}
<View style={styles.quickAccessContainer}>
  <TouchableOpacity
    style={styles.quickButton}
    onPress={() => router.push("/desafios")}
  >
    <Text style={styles.quickButtonText}>Ver Desafios</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.quickButton}
    onPress={() => router.push("/quizzes")}
  >
    <Text style={styles.quickButtonText}>Ver Quizzes</Text>
  </TouchableOpacity>
</View>


        <Text style={styles.sectionTitle}>Status dos Desafios</Text>
        <BarChart
          data={barChartData}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: "#FCFDFD",
            backgroundGradientFrom: "#E0F7E0",
            backgroundGradientTo: "#E0F7E0",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(39, 129, 72, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          }}
          style={{ marginVertical: 10, borderRadius: 10 }}
          fromZero
        />


        {/* ====== LISTA DE DESAFIOS ====== */}
        {desafios.map(d => (
          <View key={d.id} style={styles.listaDesafio}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontWeight: "bold" }}>{d.titulo}</Text>
              <Text style={{ flexWrap: "wrap" }}>{d.descricao.replace(/\\n/g, '\n')}</Text>
              <Text>{d.pontos} pontos</Text>
            </View>

            {!d.concluido ? (
              <View style={{ flexDirection: "row", gap: 5 }}>
                <TouchableOpacity
                  style={{ backgroundColor: "#278148", padding: 5, borderRadius: 5 }}
                  onPress={() => handleConcluirDesafio(d)}
                  disabled={isSubmitting}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Concluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: "#4CAF50", padding: 5, borderRadius: 5 }}
                  onPress={() => router.push(`/participar-desafio?id=${d.id}`)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold"}}>Participar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ color: "#278148", fontWeight: "bold" }}>Concluído</Text>
                <TouchableOpacity
                  style={{ backgroundColor: "#FFA500", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 }}
                  onPress={() => router.push(`/avaliar-desafio?id=${d.id}`)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Avaliar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

      </ScrollView>

      {sideMenuVisible && <SideMenu router={router} onClose={() => setSideMenuVisible(false)} />}
      {profileMenuVisible && <ProfileMenu router={router} onClose={() => setProfileMenuVisible(false)} />}
    </View>
  );
}

// ================= MENU =================
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
      <TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeText}>X</Text></TouchableOpacity>
      <Text style={styles.menuTitle}>Menu de Atividades</Text>
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
      <TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeText}>X</Text></TouchableOpacity>
      <Text style={styles.menuTitle}>Configurações e Atividade</Text>
      <MenuItem icon="account" label="Central de contas" subtitle="Senhas, segurança e dados pessoais" onPress={() => { router.push("/central-conta"); onClose(); }} />
      <MenuItem icon="star" label="Favoritos" onPress={() => { router.push("/favoritos"); onClose(); }} />
      <MenuItem icon="alert-circle" label="Sobre" onPress={() => { router.push("/sobre"); onClose(); }} />
      <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: "bold" }}>Entrar:</Text>
      <MenuItem icon="logout" label="Sair" color="#ff1a1a" onPress={() => { router.push("/login"); onClose(); }} />
    </View>
  </View>
);

// ================= ESTILOS =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F5" },
  scrollContent: { padding: 20 },
  header: {
    height: 140,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    width: "100%",
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  username: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  pointsText: { color: "#fff", marginTop: 4 },
  progressBarContainer: { marginTop: 10 },
  progressBarBackground: { height: 18, width: "100%", backgroundColor: "#ffffff33", borderRadius: 12, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#A7FFD2", borderRadius: 12 },
  progressPercentage: { marginTop: 5, color: "#fff", fontWeight: "bold", textAlign: "right" },
  cardsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 25 },
  card: { width: "48%", backgroundColor: "#FFFFFF", padding: 17, borderRadius: 14, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4.5, elevation: 4 },
  cardTitle: { fontSize: 14, fontWeight: "bold", color: "#2E6A45" },
  cardValue: { fontSize: 22, fontWeight: "bold", marginTop: 6, color: "#278148", textShadowColor: "#00000020", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 15, color: "#278148" },
  listaDesafio: { backgroundColor: "#FFFFFF", padding: 15, marginVertical: 8, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4.5, elevation: 4 },
  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  menuBackground: { flex: 1, backgroundColor: "#00000055" },
  sideMenu: { top: 0, right: 0, width: "20%", height: "100%", backgroundColor: "#fff", padding: 20, elevation: 8, shadowColor: "#000", shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 8 },
  closeButton: { alignSelf: "flex-end", padding: 5 },
  closeText: { fontSize: 16, fontWeight: "bold" },
  menuTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  quickAccessContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: 20,
},

quickButton: {
  flex: 1,
  backgroundColor: "#4CAF50",
  paddingVertical: 15,
  marginHorizontal: 5,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 4.65,
  elevation: 6,
},

quickButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},

});