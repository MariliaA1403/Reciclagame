// app/perfil-jogador/[id].js
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";

const API_URL = "https://backend-reciclagame.vercel.app";

export default function PerfilJogador() {
  const { id } = useLocalSearchParams();
  const [jogador, setJogador] = useState(null);
  const [desafios, setDesafios] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDados() {
      try {
        // Pega os dados do jogador
        const resJogador = await fetch(`${API_URL}/api/jogadores/${id}`);
        const dataJogador = await resJogador.json();
        setJogador(dataJogador);

        // Pega os desafios do jogador
        const resDesafios = await fetch(`${API_URL}/api/jogadores/${id}/desafios`);
        const dataDesafios = await resDesafios.json();
        setDesafios(dataDesafios.desafios);

        // Pega os quizzes do jogador
        const resQuizzes = await fetch(`${API_URL}/api/jogadores/${id}/quizzes`);
        const dataQuizzes = await resQuizzes.json();
        setQuizzes(dataQuizzes.quizzes);

        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados do jogador:", err);
        setLoading(false);
      }
    }

    fetchDados();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#278148" />
      </View>
    );
  }

  if (!jogador) {
    return (
      <View style={styles.centered}>
        <Text>Jogador não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ======= Cabeçalho ======= */}
      <View style={styles.header}>
        {jogador.avatar_url ? (
          <Image 
            source={{ uri: jogador.avatar_url.startsWith("http") ? jogador.avatar_url : `http://localhost:3000${jogador.avatar_url}` }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{jogador.nome[0]}</Text>
          </View>
        )}
        <Text style={styles.nome}>{jogador.nome}</Text>
      </View>

      {/* ======= Informações ======= */}
      <View style={styles.infoContainer}>
        {jogador.avatar_url && (
          <Image 
            source={{ uri: jogador.avatar_url.startsWith("http") ? jogador.avatar_url : `https://backend-reciclagame.vercel.app${jogador.avatar_url}` }} 
            style={styles.infoAvatar} 
          />
        )}

        <Text style={styles.label}>Matrícula:</Text>
        <Text style={styles.value}>{jogador.matricula}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{jogador.email || "-"}</Text>

        <Text style={styles.label}>Telefone:</Text>
        <Text style={styles.value}>{jogador.telefone || "-"}</Text>

        <Text style={styles.label}>Pontos:</Text>
        <Text style={styles.value}>{jogador.pontos || 0}</Text>

        <Text style={styles.label}>Nível:</Text>
        <Text style={styles.value}>{jogador.nivel || 0}</Text>
      </View>

      {/* ======= Desafios ======= */}
      <Text style={styles.sectionTitle}>Desafios</Text>
      {desafios.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum desafio disponível.</Text>
      ) : (
        desafios.map((d) => (
          <View key={d.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{d.titulo}</Text>
            <Text>Status: {d.status}</Text>
            {d.imagem ? <Image source={{ uri: d.imagem }} style={styles.itemImage} /> : null}
          </View>
        ))
      )}

      {/* ======= Quizzes ======= */}
      <Text style={styles.sectionTitle}>Quizzes</Text>
      {quizzes.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum quiz disponível.</Text>
      ) : (
        quizzes.map((q) => (
          <View key={q.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{q.titulo}</Text>
            <Text>Status: {q.status}</Text>
            {q.imagem ? <Image source={{ uri: q.imagem }} style={styles.itemImage} /> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#FCFDFD" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#a5d6a7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  nome: { fontSize: 22, fontWeight: "bold" },
  infoContainer: { marginBottom: 20 },
  infoAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    alignSelf: "center",
  },
  label: { fontWeight: "bold", marginTop: 5 },
  value: { marginBottom: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  emptyText: { fontStyle: "italic", color: "#555", marginLeft: 5 },
  itemCard: {
    backgroundColor: "#E0F7E0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemTitle: { fontWeight: "bold", marginBottom: 3 },
  itemImage: { width: "100%", height: 120, marginTop: 5, borderRadius: 5 },
});
