import React, { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
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
    photo: null, // inicialmente sem foto
  });

  // Função para escolher imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUser({ ...user, photo: result.assets[0].uri });
    }
  };

  if (!fontsLoaded) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* TOPO COM GRADIENTE */}
      <View style={styles.topWrapper}>
        <LinearGradient colors={GRADIENT_COLORS} style={styles.topBackground} />

        {/* HEADER */}
        <View style={styles.topHeader}>
          <View style={styles.profileWrapper}>
            <TouchableOpacity style={styles.profileEditButton} onPress={pickImage}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.profileImage} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <MaterialCommunityIcons name="account" size={28} color="#fff" />
                </View>
              )}
              <View style={styles.editIconWrapper}>
                <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <MaterialCommunityIcons name="menu" size={26} color="#000" style={styles.menuIcon} />
          <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        </View>

        {/* USER INFO */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.homeText}>Home</Text>
          <Text style={styles.subText}>Meus pontos</Text>

          <View style={styles.pointsRow}>
            <Text style={styles.pointsNumber}>{user.points}</Text>
            <Text style={styles.pointsLabel}>pontos</Text>
            <MaterialCommunityIcons
              name="trophy"
              size={26}
              color="#6B6969"
              style={{ marginLeft: 8 }}
            />
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: "0%" }]} />
          </View>
        </View>
      </View>

      {/* BOTÕES DE DESAFIOS */}
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

      {/* DESAFIO DA SEMANA */}
      <View style={styles.desafioSection}>
        <Text style={styles.sectionTitle}>Desafio da Semana</Text>

        <View style={styles.singleCard}>
          <Image
            source={require("../assets/images/desafio1.png")}
            style={styles.singleCardImage}
          />
          <Text style={styles.desafioTitulo}>Desafio da Coleta Seletiva</Text>
          <Text style={styles.desafioDescricao}>
            Participe da coleta seletiva e ajude a manter sua comunidade mais limpa!
          </Text>

          <TouchableOpacity style={styles.botaoParticipar}>
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

      {/* MENU INFERIOR */}
      <View style={styles.bottomWrapper}>
        <LinearGradient colors={GRADIENT_COLORS} style={styles.bottomSemiCircle} />
        <View style={styles.bottomMenu}>
          <FontAwesome5 name="home" size={22} color="#000" />
          <FontAwesome5 name="trophy" size={22} color="#000" />
          <FontAwesome5 name="book" size={22} color="#000" />
          <FontAwesome5 name="bars" size={22} color="#000" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { alignItems: "center" },

  // Top semicircle
  topWrapper: {
    width: "100%",
    height: 240,
    paddingTop: 15,
    paddingHorizontal: 0,
  },
  topBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
  },
  topHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  profileWrapper: {
    width: 40,
    height: 40,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
    left: 20,
  },

  profileEditButton: {
    width: "100%",
    height: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: { width: "100%", height: "100%", resizeMode: "cover" },
  defaultAvatar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#278148",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editIconWrapper: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#6B6969",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },

  logo: { width: 80, height: 80, resizeMode: "contain" },

  menuIcon: {
    position: "absolute",
    right: 20,
  },

  userInfo: {
    marginTop: 2,
    width: "100%",
    paddingHorizontal: 25,
  },
  userName: { fontSize: 12, color: "#000", marginBottom: 0 },
  homeText: { fontSize: 20, fontWeight: "900", color: "#000" },
  subText: { fontSize: 12, color: "#000" },
  pointsRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  pointsNumber: { fontSize: 20, color: "#278148", fontWeight: "bold", marginLeft: 50 },
  pointsLabel: { fontSize: 12, marginLeft: 4 },
  progressBar: { width: "80%", height: 6, backgroundColor: "#ddd", borderRadius: 10, marginTop: 8, marginLeft: 50 },
  progress: { height: "100%", backgroundColor: "#CBF9E0", borderRadius: 10 },

  // Botões desafios
  desafioButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "95%",
    marginTop: 45,
  },
  desafioButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, borderWidth: 1, borderColor: "#000" },
  desafioButtonText: { fontSize: 12, color: "#000" },

  // Desafio da semana
  desafioSection: { width: "90%", alignItems: "center", marginTop: 20 },
  sectionTitle: { width: "100%", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  singleCard: {
    width: "100%",
    backgroundColor: "#D7F3E3",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
  },
  singleCardImage: {
    width: "100%",
    height: 300,
    borderRadius: 15,
    marginBottom: 10,
    resizeMode: "cover",
  },
  desafioTitulo: { fontSize: 18, fontWeight: "bold", color: "#000", marginTop: 5 },
  desafioDescricao: { fontSize: 14, color: "#333", textAlign: "center", marginTop: 5, marginBottom: 10 },
  botaoParticipar: { backgroundColor: "#95C296", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 30 },
  botaoParticiparTexto: { color: "#000", fontWeight: "bold" },
  botaoVerMais: { marginTop: 15, backgroundColor: "#278148", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 25 },
  botaoVerMaisTexto: { color: "#fff", fontWeight: "bold" },

  // Menu inferior
  bottomWrapper: { width: "100%", height: 120, alignItems: "center", justifyContent: "center", marginTop: 30 },
  bottomSemiCircle: { position: "absolute", width: "100%", height: "100%", borderTopLeftRadius: 180, borderTopRightRadius: 180 },
  bottomMenu: { flexDirection: "row", justifyContent: "space-around", width: "70%", position: "absolute", bottom: 20 },
});
