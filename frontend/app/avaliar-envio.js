// app/avaliar-envio.js
import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, ScrollView 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:3000";

export default function AvaliarEnvios() {
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instituicao, setInstituicao] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setInstituicao(parsedUser);
          await fetchEnvios(parsedUser.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const fetchEnvios = async (instituicaoId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/envios/pendentes/${instituicaoId}`);
      const data = await res.json();
      if (data.success) setEnvios(data.envios);
      else setEnvios([]);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível carregar os envios.");
      setEnvios([]);
    } finally { setLoading(false); }
  };

  const atualizarDadosJogador = async (jogadorId) => {
    try {
      const res = await fetch(`${API_URL}/desafios?jogadorId=${jogadorId}`);
      const data = await res.json();
      if (data.success) {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        await AsyncStorage.setItem("user", JSON.stringify({
          ...parsedUser,
          pontos: data.userPoints,
          levelprogress: data.desafios.filter(d => d.concluido).length > 0
            ? Math.floor(data.desafios.filter(d => d.concluido).length / data.desafios.length * 100)
            : 0
        }));
      }
    } catch (err) { console.error(err); }
  };

  const avaliarEnvio = async (envioId, acao, jogadorId) => {
    try {
      const res = await fetch(`${API_URL}/envios/avaliar/${envioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Sucesso", `Envio ${acao === "aprovado" ? "aprovado" : "reprovado"}!`);
        setEnvios(envios.map(e => e.id === envioId ? { ...e, status: acao } : e));

        if (acao === "aprovado") await atualizarDadosJogador(jogadorId);
      } else {
        Alert.alert("Erro", data.message || "Não foi possível avaliar o envio.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível avaliar o envio.");
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avaliar Envios</Text>
      {envios.length === 0 ? (
        <Text style={{ marginTop: 20, textAlign: "center" }}>Nenhum envio pendente.</Text>
      ) : (
        <FlatList
          data={envios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            // separa as fotos em array
            const fotosArray = item.foto ? item.foto.split(",") : [];
            return (
              <View style={styles.envioCard}>
                <Text style={styles.envioText}>Aluno: {item.jogador_nome}</Text>
                <Text style={styles.envioText}>Desafio: {item.desafio_titulo}</Text>
                <Text style={styles.envioText}>Status: {item.status || "Pendente"}</Text>
                {item.texto ? <Text style={{ marginTop: 5 }}>Texto: {item.texto}</Text> : null}

                {fotosArray.length > 0 && (
                  <ScrollView horizontal style={{ marginTop: 10 }}>
                    {fotosArray.map((fotoUri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: `http://localhost:3000${fotoUri}` }}
                        style={styles.foto}
                        resizeMode="contain"
                      />
                    ))}
                  </ScrollView>
                )}

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#4caf50" }]}
                    onPress={() => avaliarEnvio(item.id, "aprovado", item.jogador_id)}
                    disabled={item.status === "aprovado"}
                  >
                    <Text style={styles.buttonText}>Aprovar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#f44336" }]}
                    onPress={() => avaliarEnvio(item.id, "reprovado", item.jogador_id)}
                    disabled={item.status === "reprovado"}
                  >
                    <Text style={styles.buttonText}>Reprovar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FCFDFD", padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  envioCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  envioText: { fontSize: 16, marginBottom: 5 },
  foto: { width: 120, height: 120, marginRight: 10, borderRadius: 5 },
  buttonsContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  button: { flex: 0.48, padding: 10, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
