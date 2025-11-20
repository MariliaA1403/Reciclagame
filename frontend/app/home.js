// app/home.js
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, JockeyOne_400Regular } from "@expo-google-fonts/jockey-one";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const GRADIENT_COLORS = ["#C9DFC9", "#95C296"];

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({ JockeyOne_400Regular });

  const [user, setUser] = useState({
    name: "Usuário",
    points: 0,
    levelProgress: 0,
  });

  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser((prev) => ({
            ...prev,
            name: parsed.name ?? prev.name,
            points: parsed.points ?? prev.points,
            levelProgress: parsed.levelProgress ?? prev.levelProgress,
          }));
        }
      } catch (err) {
        console.log("Erro ao carregar usuário do AsyncStorage:", err);
      }
    }
    loadUserFromStorage();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  const openCard = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCard = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // MENU DAS TRÊS LISTRAS
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const sideMenuAnim = useState(new Animated.Value(300))[0];

  const openSideMenu = () => {
    setSideMenuVisible(true);
    Animated.timing(sideMenuAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSideMenu = () => {
    Animated.timing(sideMenuAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSideMenuVisible(false));
  };

  // MENU DO AVATAR (LADO ESQUERDO)
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const profileMenuAnim = useState(new Animated.Value(-300))[0];

  const openProfileMenu = () => {
    setProfileMenuVisible(true);
    Animated.timing(profileMenuAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeProfileMenu = () => {
    Animated.timing(profileMenuAnim, {
      toValue: -300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setProfileMenuVisible(false));
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- TOPO SEMICÍRCULO --- */}
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.leftHeader}>
            <TouchableOpacity onPress={openProfileMenu}>
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={36} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.username}>{user.name}</Text>
              <Text style={styles.pointsText}>{user.points} pontos</Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progress, { width: `${user.levelProgress}%` }]}
                />
              </View>
            </View>
          </View>

          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={openSideMenu} style={styles.menuButton}>
              <MaterialCommunityIcons name="menu" size={28} color="#242222ff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* --- BOTÕES DESAFIOS --- */}
        <View style={styles.desafioButtons}>
          <TouchableOpacity
            style={[styles.desafioButton, { backgroundColor: "rgba(89,241,156,0.3)" }]}
          >
            <Text style={styles.desafioButtonText}>Desafios concluídos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.desafioButton, { backgroundColor: "rgba(255,32,32,0.3)" }]}
          >
            <Text style={styles.desafioButtonText}>Desafios pendentes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.desafioButton, { backgroundColor: "rgba(81,188,245,0.3)" }]}
          >
            <Text style={styles.desafioButtonText}>Desafio da Semana</Text>
          </TouchableOpacity>
        </View>

        {/* --- DESAFIO DA SEMANA COM IMAGEM --- */}
        <View style={styles.desafioSection}>
          <Text style={styles.sectionTitle}>Desafio da Semana</Text>

          <View style={styles.singleCard}>
            <Image
              source={require("../assets/images/desafio1.png")}
              style={styles.desafioImage}
              resizeMode="cover"
            />
            <Text style={styles.desafioTitulo}>Desafio da Coleta Seletiva</Text>
            <Text style={styles.desafioDescricao}>
              Participe da coleta seletiva e ajude a manter sua comunidade mais limpa!
            </Text>

            <TouchableOpacity style={styles.botaoParticipar} onPress={openCard}>
              <Text style={styles.botaoParticiparTexto}>Participar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.botaoVerMais}
            onPress={() => router.push("/desafios")}
          >
            <Text style={styles.botaoVerMaisTexto}>Ver mais desafios</Text>
          </TouchableOpacity>
        </View>

        {/* --- SEMICÍRCULO INFERIOR COM MENU --- */}
        <LinearGradient colors={GRADIENT_COLORS} style={styles.bottomSemiCircle}>
          <View style={styles.bottomMenu}>
            <FontAwesome5 name="home" size={22} color="#000" />
            <FontAwesome5 name="trophy" size={22} color="#000" />
            <FontAwesome5 name="book" size={22} color="#000" />
            <FontAwesome5 name="bars" size={22} color="#000" />
          </View>
        </LinearGradient>

        {/* --- MODAL DESAFIO --- */}
        {modalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.overlayTouch} onPress={closeCard} />
            <Animated.View
              style={[
                styles.bottomCard,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [500, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Desafio Criativo com Recicláveis</Text>
                <TouchableOpacity onPress={closeCard}>
                  <MaterialCommunityIcons name="close" size={26} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardInfo}>
                <Text style={{ fontWeight: "bold" }}>Pontuação:</Text> 50 pontos
              </Text>

              <Text style={styles.cardInfo}>
                <Text style={{ fontWeight: "bold" }}>Avaliação:</Text> ⭐⭐⭐⭐⭐
              </Text>

              <Text style={styles.cardInfo}>
                <Text style={{ fontWeight: "bold" }}>Nível:</Text> Médio
              </Text>

              <View style={styles.rulesBox}>
                <Text style={styles.ruleText}>
                  • Você deve usar pelo menos um dos materiais: garrafa PET, papelão ou tampinhas.
                </Text>
                <Text style={styles.ruleText}>
                  • Pode combinar outros materiais recicláveis (fitas, colas, tintas…).
                </Text>
                <Text style={styles.ruleText}>
                  • O produto final pode ser um brinquedo, uma mini obra de arte, um recipiente ou algo útil.
                </Text>
                <Text style={styles.ruleText}>
                  • Tire uma foto e envie um pequeno vídeo explicando o que fez.
                </Text>
              </View>

              <TouchableOpacity style={styles.cardParticiparButton}>
                <Text style={styles.cardParticiparText}>Participar</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </ScrollView>

     {/* --- MENU DAS TRÊS LISTRAS --- */}
{sideMenuVisible && (
  <View style={styles.sideMenuOverlay}>
    <TouchableOpacity style={styles.sideMenuBackground} onPress={closeSideMenu} />
    <Animated.View
      style={[styles.sideMenu, { transform: [{ translateX: sideMenuAnim }] }]}
    >
      <View style={styles.sideHeader}>
        <Text style={[styles.sideTitle, { fontSize: 16 }]}>Menu de Atividades</Text>
        <TouchableOpacity onPress={closeSideMenu}>
          <MaterialCommunityIcons name="close" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Chat com a turma */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/chat");
          closeSideMenu();
        }}
      >
        <MaterialCommunityIcons name="chat" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Chat com a turma</Text>
      </TouchableOpacity>

      {/* Feed de Notícias */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/noticias");
          closeSideMenu();
        }}
      >
        <MaterialCommunityIcons name="newspaper" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Feed de Notícias</Text>
      </TouchableOpacity>

      {/* Mapa */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/mapa");
          closeSideMenu();
        }}
      >
        <MaterialCommunityIcons name="map" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Mapa</Text>
      </TouchableOpacity>

      {/* Notificações */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/notificacoes");
          closeSideMenu();
        }}
      >
        <MaterialCommunityIcons name="bell" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Notificações</Text>
      </TouchableOpacity>

      {/* Atualizações Futuras */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/atualizacoes");
          closeSideMenu();
        }}
      >
        <MaterialCommunityIcons name="information" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Atualizações Futuras</Text>
      </TouchableOpacity>

      {/* Botão Sair */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8, marginTop: 40 }]}
        onPress={() => {
          router.push("/login"); // volta para página inicial antes do login
          closeSideMenu();
        }}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#ff1a1a" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8, color: "#ff1a1a" }]}>
          Sair
        </Text>
      </TouchableOpacity>
    </Animated.View>
  </View>
)}

 {/* --- MENU DO AVATAR (LADO ESQUERDO) --- */}
{profileMenuVisible && (
  <View style={styles.sideMenuOverlay}>
    <TouchableOpacity
      style={styles.sideMenuBackground}
      onPress={closeProfileMenu}
    />
    <Animated.View
      style={[styles.sideMenu, { transform: [{ translateX: profileMenuAnim }] }]}
    >
      <View style={styles.sideHeader}>
        <Text style={[styles.sideTitle, { fontSize: 16 }]}>Perfil</Text>
        <TouchableOpacity onPress={closeProfileMenu}>
          <MaterialCommunityIcons name="close" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Configurações */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/configuracoes");
          closeProfileMenu();
        }}
      >
        <MaterialCommunityIcons name="cog" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Configurações</Text>
      </TouchableOpacity>

      {/* Central de Contas */}
      <TouchableOpacity
        style={[styles.sideItem, { flexDirection: "row", alignItems: "center", paddingVertical: 8 }]}
        onPress={() => {
          router.push("/central-conta");
          closeProfileMenu();
        }}
      >
        <MaterialCommunityIcons name="account" size={20} color="#000" />
        <View style={{ flexDirection: "column", marginLeft: 8 }}>
          <Text style={[styles.sideText, { fontSize: 14 }]}>Central de Contas</Text>
          <Text style={{ fontSize: 10, color: "#555" }}>
            Senhas, segurança e dados pessoais
          </Text>
        </View>
      </TouchableOpacity>

      {/* Convidar Amigos */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/convidar-amigos");
          closeProfileMenu();
        }}
      >
        <MaterialCommunityIcons name="account-plus" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Convidar Amigos</Text>
      </TouchableOpacity>

      {/* Favoritos */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/favoritos");
          closeProfileMenu();
        }}
      >
        <MaterialCommunityIcons name="star" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Favoritos</Text>
      </TouchableOpacity>

      {/* Sobre */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/sobre");
          closeProfileMenu();
        }}
      >
        <MaterialCommunityIcons name="alert-circle" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Sobre</Text>
      </TouchableOpacity>

      {/* Linha separadora */}
      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 10,
          width: "100%",
        }}
      />

      {/* Entrar e Adicionar Conta */}
      <Text style={{ marginLeft: 15, marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#333" }}>
        Entrar:
      </Text>
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/adicionar-conta");
          closeProfileMenu();
        }}
      >
        <MaterialCommunityIcons name="account-plus" size={20} color="#000" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8 }]}>Adicionar Conta</Text>
      </TouchableOpacity>

      {/* Botão Sair */}
      <TouchableOpacity
        style={[styles.sideItem, { paddingVertical: 8 }]}
        onPress={() => {
          router.push("/login"); // Volta para página inicial antes do login
          closeProfileMenu();
        }}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#ff1a1a" />
        <Text style={[styles.sideText, { fontSize: 14, marginLeft: 8, color: "#ff1a1a" }]}>
          Sair
        </Text>
      </TouchableOpacity>

      {/* Caixa de pesquisa */}
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={18} color="#000" />
        <Text style={[styles.searchText, { fontSize: 12 }]}>Pesquisar...</Text>
      </View>
    </Animated.View>
  </View>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { alignItems: "center" },
  header: {
    height: 160,
    width: "100%",
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftHeader: { flexDirection: "row", alignItems: "center" },
  rightHeader: { flexDirection: "row", alignItems: "center" },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#278148",
    justifyContent: "center",
    alignItems: "center",
  },
  username: { color: "#fff", fontSize: 16, fontWeight: "600" },
  pointsText: { color: "#fff", fontSize: 14 },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginTop: 4,
  },
  progress: { height: "100%", backgroundColor: "#CBF9E0", borderRadius: 10 },
  menuButton: { padding: 5 },
  desafioButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "95%",
    marginTop: 45,
  },
  desafioButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#000",
  },
  desafioButtonText: { fontSize: 12, color: "#000" },
  desafioSection: { width: "90%", alignItems: "center", marginTop: 20 },
  sectionTitle: { width: "100%", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  singleCard: {
    width: "100%",
    backgroundColor: "#D7F3E3",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
  },
  desafioImage: { width: "100%", height: 150, borderRadius: 15, marginBottom: 10 },
  desafioTitulo: { fontSize: 18, fontWeight: "bold", color: "#000", marginTop: 5 },
  desafioDescricao: { fontSize: 14, color: "#333", textAlign: "center", marginTop: 5, marginBottom: 10 },
  botaoParticipar: { backgroundColor: "#95C296", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 30 },
  botaoParticiparTexto: { color: "#000", fontWeight: "bold" },
  botaoVerMais: { marginTop: 15, backgroundColor: "#278148", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 25 },
  botaoVerMaisTexto: { color: "#fff", fontWeight: "bold" },
  bottomSemiCircle: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  bottomMenu: { flexDirection: "row", justifyContent: "space-around", width: "70%" },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  overlayTouch: { flex: 1 },
  bottomCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#000" },
  cardInfo: { marginTop: 5, fontSize: 14, color: "#000" },
  rulesBox: { marginTop: 15, backgroundColor: "#F5D58A", padding: 15, borderRadius: 12 },
  ruleText: { marginBottom: 8, fontSize: 14, color: "#000" },
  cardParticiparButton: { marginTop: 20, backgroundColor: "#278148", paddingVertical: 12, borderRadius: 25, alignItems: "center" },
  cardParticiparText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  sideMenuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  sideMenuBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    padding: 20,
  },
  sideHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sideTitle: { fontSize: 20, fontWeight: "bold" },
  sideItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sideText: { marginLeft: 10, fontSize: 16 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 20,
  },
  searchText: { marginLeft: 5, color: "#888" },
});
