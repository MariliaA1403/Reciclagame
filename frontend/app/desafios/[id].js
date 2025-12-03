// app/desafios/[id].js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const API_URL = "https://backend-reciclagame.vercel.app"; // ou IP da máquina

export default function DesafioDetalhe() {
  const router = useRouter();
  const params = useLocalSearchParams(); // ✅ hook correto para RN
  const { id } = params;

  const [desafio, setDesafio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [avaliacao, setAvaliacao] = useState("");
  const [user, setUser] = useState(null);

  // Carrega usuário
  useEffect(() => {
    async function loadUser() {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    }
    loadUser();
  }, []);

  // Carrega desafio
  useEffect(() => {
    if (!id) return;
    async function fetchDesafio() {
      try {
        const res = await fetch(`${API_URL}/api/desafios/${id}`);
        const data = await res.json();
        if (data.success) {
          setDesafio(data.desafio);
        } else {
          Alert.alert("Erro", "Desafio não encontrado");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Erro", "Não foi possível carregar o desafio");
      } finally {
        setLoading(false);
      }
    }
    fetchDesafio();
  }, [id]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permissão necessária", "Permita acesso à galeria para enviar sua arte.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const marcarConcluida = async () => {
    if (!user || !desafio) return;

    try {
      const res = await fetch(`${API_URL}/api/desafios/concluir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: user.id,
          desafioId: desafio.id,
          image,
          avaliacao,
        }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Parabéns!", "Desafio concluído com sucesso!");
        router.push("/home");
      } else {
        Alert.alert("Erro", data.message || "Não foi possível concluir o desafio");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha ao marcar como concluída");
    }
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#278148" />
      <Text style={{ marginTop: 10 }}>Carregando desafio...</Text>
    </View>
  );

  if (!desafio) return (
    <View style={styles.centered}>
      <Text>Desafio não encontrado.</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{desafio.titulo}</Text>
      <Text style={styles.description}>{desafio.descricao}</Text>
      <Text style={styles.points}>{desafio.pontos} pontos</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>Enviar Foto da Arte</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Avaliação do Desafio:</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          placeholder="Escreva sua avaliação..."
          multiline
          numberOfLines={4}
          style={styles.textArea}
          value={avaliacao}
          onChangeText={setAvaliacao}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={marcarConcluida}>
        <Text style={styles.buttonText}>Marcar como Concluída</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F0FFF0" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#1B5E20", marginBottom: 10, textAlign: "center" },
  description: { fontSize: 16, color: "#333", marginBottom: 10, textAlign: "center" },
  points: { fontSize: 16, fontWeight: "bold", color: "#278148", marginBottom: 20, textAlign: "center" },
  imagePicker: { backgroundColor: "#D7F3E3", padding: 15, borderRadius: 20, alignItems: "center", marginBottom: 20 },
  imagePickerText: { color: "#1B5E20", fontWeight: "bold" },
  imagePreview: { width: "100%", height: 200, borderRadius: 15 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#1B5E20" },
  textAreaContainer: { backgroundColor: "#E0F7E0", borderRadius: 10, marginBottom: 20 },
  textArea: { padding: 10, textAlignVertical: "top", color: "#333" },
  button: { backgroundColor: "#278148", padding: 15, borderRadius: 25, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
