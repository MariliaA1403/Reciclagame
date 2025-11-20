// app/noticias.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const GRADIENT_COLORS = ["#C9DFC9", "#95C296"];

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    setNoticias([
      {
        title:
          "Baixa coleta é gargalo para expansão da indústria da reciclagem no Brasil",
        description:
          "Apenas 32% dos municípios brasileiros têm coleta seletiva, o que dificulta o crescimento da reciclagem no país.",
        link: "https://www.uol.com.br/ecoa/ultimas-noticias/2025/05/17/baixa-coleta-e-gargalo-para-expansao-da-industria-da-reciclagem-no-brasil.htm",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/4/44/Recycling_logo.svg",
      },
      {
        title:
          "Coleta seletiva, legislação e conscientização são pontos‑chave para avançar na reciclagem do lixo",
        description:
          "O Brasil produz 90 milhões de toneladas de lixo por ano, mas recicla apenas 4%. Especialistas defendem mais coleta seletiva e políticas públicas para melhorar a reciclagem.",
        link: "https://agenciagov.ebc.com.br/noticias/202503/coleta-seletiva-legislacao-e-conscientizacao-sao-pontos-chave-para-reduzir-impactos-ambientais-e-avancar-na-reciclagem-do-lixo",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Recycling_symbol2.svg/512px-Recycling_symbol2.svg.png",
      },
      {
        title:
          "Reciclagem de resíduos chega a 8% no Brasil com trabalho informal, aponta estudo",
        description:
          "Estudo revela que catadores informais são responsáveis por grande parte da reciclagem no país.",
        link: "https://www.abrerpi.org.br/noticias/noticia/reciclagem-de-residuos-chega-a-8-no-brasil-com-trabalho-informal-aponta-estudo",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Recycling_symbol2.svg/512px-Recycling_symbol2.svg.png",
      },
    ]);
  }, []);

  const abrirLink = (url) => Linking.openURL(url);

  // Menu lateral
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

  const goHome = () => {
    router.push("/home");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {/* --- CABEÇALHO SEMICÍRCULO --- */}
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.leftHeader}>
            <Image
              source={require("../assets/images/foto_perfil.jpeg")}
              style={styles.profileImage}
            />
            <Text style={styles.username}>Usuário</Text>
          </View>

          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={goHome}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={openSideMenu} style={styles.menuButton}>
              <MaterialCommunityIcons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* --- NOTÍCIAS --- */}
        <View style={styles.container}>
          {noticias.map((item, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
              />
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <TouchableOpacity onPress={() => abrirLink(item.link)}>
                <Text style={styles.link}>Ler mais</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>

      {/* --- MENU LATERAL --- */}
      {sideMenuVisible && (
        <View style={styles.sideMenuOverlay}>
          <TouchableOpacity
            style={styles.sideMenuBackground}
            onPress={closeSideMenu}
          />
          <Animated.View
            style={[styles.sideMenu, { transform: [{ translateX: sideMenuAnim }] }]}
          >
            <View style={styles.sideHeader}>
              <Text style={styles.sideTitle}>Menu</Text>
              <TouchableOpacity onPress={closeSideMenu}>
                <MaterialCommunityIcons name="close" size={26} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sideItem} onPress={goHome}>
              <MaterialCommunityIcons name="home" size={24} color="#000" />
              <Text style={styles.sideText}>Menu de Atividades</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sideItem}
              onPress={() => router.push("/chat")}
            >
              <MaterialCommunityIcons name="chat" size={24} color="#000" />
              <Text style={styles.sideText}>Chat com a turma</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sideItem}
              onPress={() => router.push("/mapa")}
            >
              <MaterialCommunityIcons name="map" size={24} color="#000" />
              <Text style={styles.sideText}>Mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sideItem}
              onPress={() => router.push("/notificacoes")}
            >
              <MaterialCommunityIcons name="bell" size={24} color="#000" />
              <Text style={styles.sideText}>Notificações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sideItem}
              onPress={() => router.push("/atualizacoes")}
            >
              <MaterialCommunityIcons name="update" size={24} color="#000" />
              <Text style={styles.sideText}>Atualizações Futuras</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftHeader: { flexDirection: "row", alignItems: "center" },
  rightHeader: { flexDirection: "row", alignItems: "center" },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 10,
  },
  username: { color: "#fff", fontSize: 16, fontWeight: "600" },
  logo: { width: 100, height: 100, resizeMode: "contain", marginRight: 10 },
  menuButton: { padding: 5 },

  container: { padding: 20, backgroundColor: "#fff" },
  card: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
  newsTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  description: { fontSize: 14, color: "#555", marginBottom: 10 },
  link: { color: "#1C7C54", fontWeight: "bold", fontSize: 14 },

  sideMenuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  sideMenuBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sideMenu: { width: 280, backgroundColor: "#fff", padding: 20, justifyContent: "flex-start" },
  sideHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sideTitle: { fontSize: 18, fontWeight: "bold" },
  sideItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sideText: { fontSize: 16, marginLeft: 10 },
});
