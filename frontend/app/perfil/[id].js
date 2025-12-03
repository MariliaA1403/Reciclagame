import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://backend-reciclagame.vercel.app"; 

export default function PerfilUsuario() {
  const router = useRouter();
  const { id } = useSearchParams(); 
  const [usuario, setUsuario] = useState(null);
  const [desafios, setDesafios] = useState([]);

  useEffect(() => {
    async function loadUsuario() {
      try {
        const response = await fetch(`${API_URL}/api/jogador/${id}`);
        const data = await response.json();
        if (data.success) setUsuario(data.jogador);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    }

    async function loadDesafios() {
      try {
        const response = await fetch(`${API_URL}/api/desafios?jogadorId=${id}`);
        const data = await response.json();
        if (data.success) setDesafios(data.desafios);
      } catch (err) {
        console.error("Erro ao carregar desafios:", err);
      }
    }

    loadUsuario();
    loadDesafios();
  }, [id]);

  if (!usuario) return <Text>Carregando...</Text>;

  // Função para participar do desafio do usuário visitado
  const handleParticipar = async (desafioId, pontos) => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (!raw) return Alert.alert("Erro", "Você precisa estar logado.");

      const jogadorLogado = JSON.parse(raw);

      const response = await fetch(`${API_URL}/api/desafios/concluir/${desafioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogadorId: jogadorLogado.id, pontosGanhos: pontos }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Sucesso!", `Você concluiu o desafio e ganhou ${pontos} pontos!`);
      } else {
        Alert.alert("Erro", data.message || "Não foi possível concluir o desafio.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao participar do desafio.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{usuario.nome}</Text>
      <Text>Pontos: {usuario.pontos}</Text>

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Desafios do Usuário:</Text>

      {desafios.map(d => (
        <View key={d.id} style={styles.card}>
          <Text style={{ fontWeight: "bold" }}>{d.titulo}</Text>
          <Text>{d.descricao}</Text>
          <Text>{d.pontos} pontos</Text>

          {!d.concluido ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleParticipar(d.id, d.pontos)}
            >
              <Text style={styles.buttonText}>Participar</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: "#278148", fontWeight: "bold", marginTop: 10 }}>
              Concluído
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E8F5E9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#D7F3E3", padding: 15, borderRadius: 10, marginVertical: 10 },
  button: { backgroundColor: "#388E3C", padding: 10, borderRadius: 20, marginTop: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
