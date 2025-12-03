import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = "http://localhost:3000";

export default function Favoritos() {
  const [loading, setLoading] = useState(true);
  const [favoritosDesafios, setFavoritosDesafios] = useState([]);
  const [favoritosQuizzes, setFavoritosQuizzes] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (!raw) return;

        const user = JSON.parse(raw);
        setUserId(user.id);

        const favRes = await fetch(`${API_URL}/api/favoritos/${user.id}`);
        const favData = await favRes.json();
        if (favData.success) {
          setFavoritosDesafios(favData.desafios || []);
          setFavoritosQuizzes(favData.quizzes || []);
        }

        const avRes = await fetch(`${API_URL}/api/avaliacoes/jogador/${user.id}`);
        const avData = await avRes.json();
        if (avData.success) {
          setAvaliacoes(avData.avaliacoes || []);
        }
      } catch (error) {
        console.log("Erro ao carregar favoritos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  const renderStars = (count) => (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text key={n} style={{ fontSize: 20, color: n <= count ? "#FFD700" : "#ccc" }}>
          ★
        </Text>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const desafiosAvaliados = avaliacoes.filter((av) => av.tipo === "desafio");

  const isAvaliacao = (desafioId) =>
    desafiosAvaliados.find((av) => av.referencia_id === desafioId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* ===================== */}
      {/*  DESAFIOS AVALIADOS */}
      {/* ===================== */}
      <Text style={styles.title}>⭐ Minhas Avaliações</Text>
      {desafiosAvaliados.length === 0 ? (
        <Text style={styles.empty}>Você ainda não avaliou nenhum desafio.</Text>
      ) : (
        desafiosAvaliados.map((av) => (
          <View key={av.referencia_id} style={styles.card}>
            <Text style={styles.cardTitle}>{av.titulo}</Text>
            {renderStars(av.nota)}
            {av.comentario && <Text style={styles.comment}>“{av.comentario}”</Text>}
            <Pressable
              style={styles.buttonSecondary}
              onPress={() => router.push(`/avaliar-desafio?id=${av.referencia_id}`)}
            >
              <Text style={styles.buttonSecondaryText}>Editar Avaliação</Text>
            </Pressable>
          </View>
        ))
      )}

      {/* ===================== */}
      {/*  FAVORITOS - DESAFIOS */}
      {/* ===================== */}
      <Text style={styles.sectionTitle}>❤️ Desafios Favoritados</Text>
      {favoritosDesafios.length === 0 ? (
        <Text style={styles.empty}>Você não favoritou nenhum desafio ainda.</Text>
      ) : (
        favoritosDesafios.map((item) => {
          const avaliacao = isAvaliacao(item.id);
          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              {item.imagem && (
                <Image
                  source={{ uri: `${API_URL}/uploads/${item.imagem}` }}
                  style={styles.image}
                />
              )}
              {avaliacao ? (
                <>
                  {renderStars(avaliacao.nota)}
                  {avaliacao.comentario && (
                    <Text style={styles.comment}>“{avaliacao.comentario}”</Text>
                  )}
                  <Pressable
                    style={styles.buttonSecondary}
                    onPress={() => router.push(`/avaliar-desafio?id=${item.id}`)}
                  >
                    <Text style={styles.buttonSecondaryText}>Editar Avaliação</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.button}
                  onPress={() => router.push(`/avaliar-desafio?id=${item.id}`)}
                >
                  <Text style={styles.buttonText}>Avaliar Desafio</Text>
                </Pressable>
              )}
            </View>
          );
        })
      )}

      {/* ===================== */}
      {/*  FAVORITOS - QUIZZES */}
      {/* ===================== */}
      <Text style={styles.sectionTitle}>❤️ Quizzes Favoritados</Text>
      {favoritosQuizzes.length === 0 ? (
        <Text style={styles.empty}>Você não favoritou nenhum quiz ainda.</Text>
      ) : (
        favoritosQuizzes.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Pressable
              style={styles.button}
              onPress={() => router.push(`/avaliar-quiz?id=${item.id}`)}
            >
              <Text style={styles.buttonText}>Avaliar Quiz</Text>
            </Pressable>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15, color: "#333" },
  sectionTitle: { fontSize: 22, fontWeight: "600", marginVertical: 20, color: "#4CAF50" },
  empty: { fontSize: 16, color: "#777", marginBottom: 15, textAlign: "center" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#333" },

  image: { width: "100%", height: 160, borderRadius: 12, marginVertical: 10 },
  comment: { fontStyle: "italic", color: "#555", marginVertical: 8 },

  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  buttonSecondary: {
    backgroundColor: "#FF8C00",
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#FF8C00",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSecondaryText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
