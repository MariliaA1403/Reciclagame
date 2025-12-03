// app/HomeInstituicao.js
import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Dimensions, TextInput, Image, Alert, Platform 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;
const API_URL = "https://backend-reciclagame.vercel.app";

export default function HomeInstituicao() {
  const router = useRouter();
  const [instituicao, setInstituicao] = useState({ id: null, nome: "", logo_url: null });
  const [jogadores, setJogadores] = useState([]);
  const [filteredJogadores, setFilteredJogadores] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  // ======= Load Instituição =======
  useEffect(() => {
    async function loadInstituicao() {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setInstituicao(parsedUser);
          await fetchJogadores(parsedUser.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro ao carregar instituição:", err);
        setLoading(false);
      }
    }
    loadInstituicao();
  }, []);

  // ======= Fetch jogadores e pontos =======
  const fetchJogadores = async (instituicaoId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/jogadores/instituicao/${instituicaoId}`);
      const data = await res.json();
      if (!data.success) return;

      // Para cada jogador, buscar pontos totais (desafios + quizzes)
      const jogadoresComPontos = await Promise.all(
        data.jogadores.map(async (j) => {
          try {
            const pontosRes = await fetch(`${API_URL}/api/jogadores/${j.id}/pontos-total`);
            const pontosData = await pontosRes.json();
            return {
              ...j,
              pontos: pontosData.totalFinal,
              pontosDesafios: pontosData.totalDesafios,
              pontosQuizzes: pontosData.totalQuizzes,
            };
          } catch {
            return { ...j, pontos: 0, pontosDesafios: 0, pontosQuizzes: 0 };
          }
        })
      );

      setJogadores(jogadoresComPontos);
      setFilteredJogadores(jogadoresComPontos);
    } catch (err) {
      console.error(err);
      setJogadores([]);
      setFilteredJogadores([]);
    } finally {
      setLoading(false);
    }
  };

  // ======= Filtro de busca =======
  useEffect(() => {
    if (!searchText) setFilteredJogadores(jogadores);
    else {
      const filtered = jogadores.filter(j =>
        j.nome.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredJogadores(filtered);
    }
  }, [searchText, jogadores]);

  // ======= Totalizadores =======
  const totalPoints = jogadores.reduce((sum, j) => sum + (j.pontos || 0), 0);
  const totalDesafios = jogadores.reduce((sum, j) => sum + (j.pontosDesafios || 0), 0);
  const totalQuizzes = jogadores.reduce((sum, j) => sum + (j.pontosQuizzes || 0), 0);

  const topJogadores = [...jogadores]
    .sort((a, b) => (b.pontos || 0) - (a.pontos || 0))
    .slice(0, 5);

  const barChartData = {
    labels: topJogadores.map(j => j.nome),
    datasets: [{ data: topJogadores.map(j => j.pontos || 0) }]
  };

  const pieChartData = [
    { name: "Desafios", population: totalDesafios, color: "#4caf50", legendFontColor: "#333", legendFontSize: 14 },
    { name: "Quizzes", population: totalQuizzes, color: "#ff9800", legendFontColor: "#333", legendFontSize: 14 }
  ];

  // ======= Upload de foto =======
  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    try {
      const res = await fetch(`${API_URL}/api/instituicoes/${instituicao.id}/foto`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const updatedInstituicao = { ...instituicao, logo_url: data.logo_url };
        setInstituicao(updatedInstituicao);
        await AsyncStorage.setItem("user", JSON.stringify(updatedInstituicao));
        Alert.alert("Sucesso", "Foto atualizada!");
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a foto.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao enviar arquivo.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            {instituicao.logo_url ? (
              <Image source={{ uri: `${API_URL}${instituicao.logo_url}` }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{instituicao.nome[0]}</Text>
              </View>
            )}
            <Text style={styles.instituicaoNome}>{instituicao.nome}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/chat")}>
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Upload de foto */}
        <input type="file" accept="image/*" onChange={handleUploadFoto} style={{ marginVertical: 10 }} />

        {/* Dashboard */}
        <View style={styles.dashboardContainer}>
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Jogadores Totais</Text>
              <Text style={styles.cardValue}>{jogadores.length}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pontos Totais</Text>
              <Text style={styles.cardValue}>{totalPoints}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pontos Desafios</Text>
              <Text style={styles.cardValue}>{totalDesafios}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pontos Quizzes</Text>
              <Text style={styles.cardValue}>{totalQuizzes}</Text>
            </View>
          </View>

          {/* Pesquisa */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar jogador..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Botão Avaliar Envios */}
          <TouchableOpacity
            style={styles.avaliarButton}
            onPress={() => router.push("/avaliar-envio")}
          >
            <Text style={styles.avaliarButtonText}>Avaliar Envios</Text>
          </TouchableOpacity>

          {/* Gráfico de Barras */}
          <Text style={styles.sectionTitle}>Top Jogadores</Text>
          {topJogadores.length > 0 && (
            <BarChart
              data={barChartData}
              width={screenWidth - 30}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: "#E0F7E0",
                backgroundGradientFrom: "#E0F7E0",
                backgroundGradientTo: "#C8E6C9",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(39, 129, 72, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              style={{ marginVertical: 10, borderRadius: 10 }}
              fromZero
            />
          )}

          {/* Gráfico de Pizza */}
          <Text style={styles.sectionTitle}>Distribuição Pontos (Desafios x Quizzes)</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 30}
            height={180}
            chartConfig={{
              backgroundGradientFrom: "#E0F7E0",
              backgroundGradientTo: "#C8E6C9",
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />

          {/* Lista de Jogadores */}
          <Text style={styles.sectionTitle}>Todos os Jogadores</Text>
          {loading ? (
            <Text style={{ marginLeft: 15 }}>Carregando jogadores...</Text>
          ) : (
            <FlatList
              data={filteredJogadores}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.jogadorCard}>
                  <Text style={styles.jogadorNome}>{item.nome}</Text>
                  <Text>Status: {item.statusDesafio || "Não iniciado"}</Text>
                  <Text>Desafios Concluídos: {item.concluidos}</Text>
                  <Text>Pontos Desafios: {item.pontosDesafios || 0}</Text>
                  <Text>Pontos Quizzes: {item.pontosQuizzes || 0}</Text>
                  <Text>Pontos Totais: {item.pontos || 0}</Text>

                  <TouchableOpacity
                    style={styles.verPerfilButton}
                    onPress={() => router.push(`/perfil-jogador/${item.id}`)}
                  >
                    <Text style={styles.verPerfilText}>Ver perfil</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* Menu lateral */}
      {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackground} onPress={() => setMenuVisible(false)} />
          <View style={styles.sideMenu}>
            <TouchableOpacity onPress={() => { AsyncStorage.removeItem("user"); router.push("/login"); }} style={styles.menuItem}>
              <MaterialCommunityIcons name="logout" size={20} color="#ff1a1a" />
              <Text style={styles.menuItemText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ======= Styles =======
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#FCFDFD", paddingBottom: 20 },
  header: {
    height: 70,
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoContainer: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 45, height: 45, borderRadius: 22, marginRight: 10 },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 22, backgroundColor: "#a5d6a7", justifyContent: "center", alignItems: "center", marginRight: 10 },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  instituicaoNome: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  dashboardContainer: { paddingVertical: 15 },
  cardsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 15 },
  card: { width: "48%", backgroundColor: "#E0F7E0", padding: 15, borderRadius: 10, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  cardValue: { fontSize: 18, fontWeight: "bold", color: "#278148" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, marginHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: "#ccc" },
  searchInput: { flex: 1, padding: 10 },
  avaliarButton: {
    marginHorizontal: 15,
    backgroundColor: "#ff9800",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10
  },
  avaliarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, marginLeft: 15 },
  jogadorCard: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ddd", marginHorizontal: 15 },
  jogadorNome: { fontWeight: "bold", fontSize: 16, marginBottom: 3 },
  verPerfilButton: { marginTop: 5, padding: 6, backgroundColor: "#278148", borderRadius: 5, alignItems: "center" },
  verPerfilText: { color: "#fff", fontWeight: "bold" },
  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  menuBackground: { flex: 1 },
  sideMenu: { position: "absolute", top: 0, bottom: 0, width: 240, backgroundColor: "#fff", padding: 20 },
  menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  menuItemText: { marginLeft: 10, fontSize: 16, color: "#ff1a1a", fontWeight: "bold" },
});
