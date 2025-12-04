// =================== ParticiparDesafio.js ===================
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const API_URL = "https://backend-reciclagame.vercel.app"; 
const screenWidth = Dimensions.get("window").width;

export default function ParticiparDesafio() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [user, setUser] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  // ============================
  // FUNÇÃO → BUSCAR USUÁRIO + PONTOS ATUALIZADOS
  // ============================
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

  // ============================
  // ENVIAR PARTICIPAÇÃO
  // ============================
  const enviarParticipacao = async () => {
    if (!descricao) {
      Alert.alert("Aviso", "Escreva uma descrição para sua participação.");
      return;
    }

    try {
      const payload = {
        jogador_id: user.id,
        desafio_id: id,
        descricao,
      };

      const res = await fetch(`${API_URL}/envios/desafios/participar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("Sucesso", "Participação enviada!");
        setDescricao("");
      } else {
        Alert.alert("Erro", data.message || "Não foi possível enviar.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao enviar participação.");
    }
  };

  if (!user) return <Text>Carregando...</Text>;

  // ======== MENU ITEM =========
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

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f9fc" }}>
      {/* ======== CABEÇALHO INTEGRADO ======== */}
      <LinearGradient
        colors={['#C9DFC9', '#95C296']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => setProfileMenuVisible(true)}>
          <MaterialCommunityIcons name="account-circle" size={60} color="#fff" />
        </TouchableOpacity>

        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.username}>{user.nome}</Text>
          <Text style={styles.pointsText}>{user.pontos || 0} pontos</Text>
        </View>

        <TouchableOpacity onPress={() => setSideMenuVisible(true)}>
          <MaterialCommunityIcons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* ======== CONTEÚDO ======== */}
      <ScrollView
        contentContainerStyle={styles.container}
        style={{ marginTop: -40 }} // "gruda" o conteúdo no header
      >
        <Text style={styles.title}>Participar do Desafio</Text>

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.textArea}
          multiline
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descreva sua participação..."
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={enviarParticipacao}>
          <Text style={styles.buttonText}>Enviar Participação</Text>
        </TouchableOpacity>
      </ScrollView>

      {sideMenuVisible && <SideMenu router={router} onClose={() => setSideMenuVisible(false)} />}
      {profileMenuVisible && <ProfileMenu router={router} onClose={() => setProfileMenuVisible(false)} />}
    </View>
  );
}

// =================== ESTILOS ===================
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 60, backgroundColor: "#f6f9fc" },
  header: {
    height: 140,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 22,
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    width: "100%",
    zIndex: 1,
  },
  username: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  pointsText: { color: "#fff", marginTop: 4 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 25, textAlign: "center", color: "#2e7d32" },
  label: { marginTop: 20, fontWeight: "600", fontSize: 16, color: "#333" },
  textArea: { borderWidth: 1, borderColor: "#cfcfcf", borderRadius: 12, padding: 15, marginTop: 8, height: 140, textAlignVertical: "top", backgroundColor: "#fff" },
  button: { backgroundColor: "#4CAF50", paddingVertical: 16, marginTop: 35, borderRadius: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  menuBackground: { flex: 1, backgroundColor: "#00000055" },
  sideMenu: { top: 0, right: 0, width: "20%", height: "100%", backgroundColor: "#fff", padding: 20, elevation: 8, shadowColor: "#000", shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 8 },
  closeButton: { alignSelf: "flex-end", padding: 5 },
  closeText: { fontSize: 16, fontWeight: "bold" },
  menuTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
});
