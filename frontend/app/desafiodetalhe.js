import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router"; // useLocalSearchParams é suportado
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://backend-reciclagame.vercel.app";
const imagens = {
  1: require("../assets/images/desafio1.png"),
  2: require("../assets/images/desafio2.png"),
  3: require("../assets/images/desafio3.png"),
};

export default function DesafioDetalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // CORRETO para React Native + Expo Router
  const [desafio, setDesafio] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUserId(JSON.parse(raw).id);
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function loadDesafio() {
      try {
        const res = await fetch(`${API_URL}/api/desafios?jogadorId=${userId}`);
        const data = await res.json();
        if (data.success) {
          const d = data.desafios.find(item => item.id == id);
          setDesafio(d);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (userId) loadDesafio();
  }, [userId]);

  const handleConcluir = async () => {
    try {
      const res = await fetch(`${API_URL}/api/desafios/concluir/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogadorId: userId, pontosGanhos: desafio.pontos }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Parabéns!", `Você concluiu o desafio e ganhou ${desafio.pontos} pontos!`);
        router.back();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível concluir o desafio.");
    }
  };

  if (!desafio) return <Text>Carregando...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={imagens[desafio.id] || imagens[1]} style={styles.image} />
      <Text style={styles.title}>{desafio.titulo}</Text>
      <Text style={styles.description}>{desafio.descricao}</Text>
      {!desafio.concluido && (
        <TouchableOpacity style={styles.button} onPress={handleConcluir}>
          <Text style={styles.buttonText}>Concluir</Text>
        </TouchableOpacity>
      )}
      {desafio.concluido && <Text style={{ color: "#278148", fontWeight: "bold" }}>Concluído</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center", backgroundColor: "#E8F5E9" },
  image: { width: "100%", height: 250, borderRadius: 20, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#1B5E20" },
  description: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: "#388E3C", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
