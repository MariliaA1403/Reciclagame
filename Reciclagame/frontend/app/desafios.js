// app/desafios.js
import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

const GRADIENT_COLORS = ["#C9DFC9", "#95C296"]; // gradiente da Home

export default function DesafiosScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/home"); // vai para a tela Home
  };

  const handleMenu = () => {
    console.log("Menu pressionado!"); 
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Lado esquerdo: perfil */}
        <View style={styles.leftHeader}>
          <Image
            source={require("../assets/images/foto_perfil.jpeg")}
            style={styles.profileImage}
          />
          <Text style={styles.username}>Usuário</Text>
        </View>

        {/* Lado direito: logo + menu */}
        <View style={styles.rightHeader}>
          <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          <TouchableOpacity onPress={handleMenu} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* CONTEÚDO */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Desafios Semanais</Text>

        <View style={styles.cardsRow}>
          {/* Card 1 */}
          <View style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image
                source={require("../assets/images/desafio1.png")}
                style={styles.cardImage}
              />
            </View>
            <Text style={styles.cardTitle}>Desafio da Semana</Text>
            <Text style={styles.cardDescription}>
              Recolha 10 garrafas PET e troque por pontos sustentáveis.
            </Text>
            <Text style={styles.pointsText}>20 pontos</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Participar</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2 */}
          <View style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image
                source={require("../assets/images/desafio2.png")}
                style={styles.cardImage}
              />
            </View>
            <Text style={styles.cardTitle}>Desafio Extra</Text>
            <Text style={styles.cardDescription}>
              Separe corretamente 5 tipos de lixo reciclável.
            </Text>
            <Text style={styles.pointsText}>15 pontos</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Participar</Text>
            </TouchableOpacity>
          </View>

          {/* Card 3 */}
          <View style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image
                source={require("../assets/images/desafio3.png")}
                style={styles.cardImage}
              />
            </View>
            <Text style={styles.cardTitle}>Desafio Comunitário</Text>
            <Text style={styles.cardDescription}>
              Ajude a mapear pontos de coleta irregular de lixo no seu bairro.
            </Text>
            <Text style={styles.pointsText}>25 pontos</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Participar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>Desafios Futuros</Text>
        <View style={styles.futureCard}>
          <Text style={styles.futureText}>
            Em breve, novos desafios estarão disponíveis!
          </Text>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E9" },

  // HEADER
  header: {
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80, // aumentei tamanho igual aos desafios
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 10,
  },
  username: { color: "#fff", fontSize: 16, fontWeight: "600" },
  logo: { width: 100, height: 100, resizeMode: "contain", marginRight: 10 },
  menuButton: { padding: 5 },

  // SCROLL CONTAINER
  scrollContainer: { padding: 20, paddingBottom: 100 },

  // TITLES
  title: { fontSize: 22, fontWeight: "700", color: "#2E7D32", marginBottom: 10 },

  // CARDS
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  card: {
    width: "48%",
    backgroundColor: "#D7F3E3",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  imageWrapper: { width: "100%", borderRadius: 20, overflow: "hidden", marginBottom: 10 },
  cardImage: { width: "100%", height: 250, resizeMode: "cover" },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1B5E20", marginBottom: 5, textAlign: "center" },
  cardDescription: { fontSize: 14, textAlign: "center", color: "#333", marginBottom: 5 },
  pointsText: { fontSize: 14, fontWeight: "600", color: "#1B5E20", marginBottom: 10 },
  button: { backgroundColor: "#388E3C", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 25 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  // FUTURE CARD
  futureCard: { width: "100%", backgroundColor: "#C8E6C9", borderRadius: 15, padding: 25, alignItems: "center" },
  futureText: { color: "#2E7D32", fontSize: 15, fontWeight: "500" },

  // BACK BUTTON
  backButton: { marginTop: 30, backgroundColor: "#81C784", paddingVertical: 10, borderRadius: 20, alignItems: "center" },
  backButtonText: { color: "#1B5E20", fontWeight: "700", fontSize: 16 },
});
