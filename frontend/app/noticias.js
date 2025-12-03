// app/noticias.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const API_URL = "http://localhost:3000";
const GRADIENT_COLORS = ["#C9DFC9", "#95C296"];

export default function NoticiasScreen() {
  const router = useRouter();

  const [user, setUser] = useState({
    id: null,
    nome: "Usuário",
    pontos: 0,
    avatar_url: null,
  });

  const [sideMenuVisible, setSideMenuVisible] = useState(false);

  // ===================== NOTÍCIAS =====================
  const noticias = [
    {
      id: 1,
      titulo: "Brasil aumenta reciclagem de PET em 14%",
      descricao:
        "Relatório nacional mostra crescimento significativo na reciclagem de garrafas PET.",
      imagem:
        "https://th.bing.com/th/id/OIP.FMan_PBwWL8fuFsscZLzlAHaEK?w=284&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3",
      link: "https://noticias.uol.com.br/ultimas-noticias/agencia-brasil/2025/03/24/em-dois-anos-pais-aumenta-reciclagem-de-embalagens-pet-em-14.htm",
    },
    {
      id: 2,
      titulo: "Coleta seletiva ganha força no Brasil",
      descricao:
        "Governo anuncia novas iniciativas para ampliar reciclagem e reduzir impacto ambiental.",
      imagem: "https://blog.atlantikos.com.br/wp-content/uploads/2022/06/Coleta-Seletiva3-1200x800.jpg",
      link: "https://agenciagov.ebc.com.br/noticias/202503/coleta-seletiva-legislacao-e-conscientizacao-sao-pontos-chave-para-reduzir-impactos-ambientais-e-avancar-na-reciclagem-do-lixo",
    },
    {
      id: 3,
      titulo: "Indústrias reclamam da baixa coleta",
      descricao:
        "Setor aponta que falta de coleta seletiva é o principal gargalo no país.",
      imagem:
        "https://conteudo.imguol.com.br/c/entretenimento/d2/2023/02/03/coleta-seletiva-1675444331114_v2_900x506.jpg.webp",
      link: "https://www.uol.com.br/ecoa/ultimas-noticias/2025/05/17/baixa-coleta-e-gargalo-para-expansao-da-industria-da-reciclagem-no-brasil.htm",
    },
    {
      id: 4,
      titulo: "Reciclagem de plástico melhora em 2024",
      descricao:
        "Estudo aponta avanços, mas reforça necessidade de mais investimentos para catadores.",
      imagem:
        "https://imagens.ne10.uol.com.br/veiculos/_midias/jpg/2020/08/21/806x444/1_rb__6802-16542151.jpg?68daba5c8782b?ims=1600x1066",
      link: "https://jc.uol.com.br/pernambuco/2025/09/29/reciclagem-de-plasticos-no-brasil-melhora-em-2024-e-aponta-necessidade-de-novos-investimentos-para-catadores.html",
    },
    {
      id: 5,
      titulo: "Apenas 8,3% do lixo urbano é reciclado",
      descricao:
        "Reportagem revela situação crítica e aponta caminhos para melhorar o aproveitamento.",
      imagem: "https://conteudo.imguol.com.br/c/entretenimento/87/2025/01/16/trabalho-de-de-coleta-seletiva-na-coopercaps-1737052879076_v2_900x506.jpg.webp",
      link: "https://www.uol.com.br/ecoa/noticias/deutsche-welle/2025/01/17/como-o-brasil-poderia-melhorar-a-destinacao-do-seu-lixo.htm",
    },
  ];

  const loadUserAndPontos = async () => {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const userId = parsed.id;

    try {
      const userRes = await fetch(`${API_URL}/api/jogadores/${userId}`);
      const userData = await userRes.json();

      const pontosRes = await fetch(
        `${API_URL}/api/jogadores/${userId}/pontos-total`
      );
      const pontosData = await pontosRes.json();

      setUser({
        id: userId,
        nome: userData.nome || "Usuário",
        pontos: pontosData.success ? pontosData.totalFinal : 0,
        avatar_url: userData.avatar_url
          ? `${API_URL}${userData.avatar_url}`
          : null,
      });
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserAndPontos();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* ===================== HEADER ===================== */}
      <LinearGradient colors={GRADIENT_COLORS} style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => setSideMenuVisible(true)}
        >
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons
              name="account-circle"
              size={60}
              color="#fff"
            />
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.username}>{user.nome}</Text>
            <Text style={styles.pointsText}>{user.pontos} pontos</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* ===================== LISTA DE NOTÍCIAS ===================== */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {noticias.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => Linking.openURL(item.link)}
          >
            <Image source={{ uri: item.imagem }} style={styles.cardImg} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDesc}>{item.descricao}</Text>
              <Text style={styles.cardLink}>Ler notícia completa →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ===================== MENU LATERAL ===================== */}
      {sideMenuVisible && (
        <SideMenu router={router} onClose={() => setSideMenuVisible(false)} />
      )}
    </View>
  );
}

/* ===================== COMPONENTES ===================== */
const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={22} color="#000" />
    <Text style={styles.menuItemText}>{label}</Text>
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

      <MenuItem
        icon="home"
        label="Home"
        onPress={() => {
          router.push("/home");
          onClose();
        }}
      />
      <MenuItem
        icon="newspaper"
        label="Notícias"
        onPress={() => {
          router.push("/noticias");
          onClose();
        }}
      />
      <MenuItem
        icon="trophy"
        label="Desafios"
        onPress={() => {
          router.push("/desafios");
          onClose();
        }}
      />
      <MenuItem
        icon="logout"
        label="Sair"
        onPress={() => {
          AsyncStorage.removeItem("user");
          router.push("/login");
          onClose();
        }}
      />
    </View>
  </View>
);

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: 140,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  username: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  pointsText: { color: "#fff", marginTop: 4 },

  scroll: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
  },
  cardImg: {
    width: "100%",
    height: 170,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  cardDesc: { fontSize: 14, color: "#555", marginBottom: 10 },
  cardLink: { color: "#1e88e5", fontWeight: "bold", fontSize: 14 },

  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0, // <<< MENU DO LADO ESQUERDO
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  menuBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sideMenu: {
    width: 260,
    backgroundColor: "#fff",
    padding: 20,
    position: "absolute",
    left: 0, // <<< ESSA LINHA COLOCA O MENU NO LADO ESQUERDO
    top: 0,
    bottom: 0,
  },
  closeButton: { alignSelf: "flex-end" },
  closeText: { fontSize: 22, fontWeight: "bold" },
  menuTitle: {
    fontSize: 18,
    marginVertical: 20,
    fontWeight: "bold",
    color: "#2E7D32", // verde igual os outros menus
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold"
  },
});
