/// app/quiz/play/[quiz].js
import React, { useEffect, useState, useCallback } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Modal, ActivityIndicator, Image 
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const API_URL = "http://localhost:3000";
const GRADIENT_COLORS = ["#C9DFC9", "#95C296"];

export default function QuizPlayScreen() {
  const { quiz, jogador_id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState({ id: null, nome: "Usuário", pontos: 0, avatar_url: null });
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [canPlay, setCanPlay] = useState(true);
  const [warning, setWarning] = useState(false);

  // ======================================================
  // CARREGA USUÁRIO + PONTOS DO BANCO
  // ======================================================
  async function loadUserAndPontos() {
    const raw = await AsyncStorage.getItem("user");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const userId = parsed.id;

    try {
      const resUser = await fetch(`${API_URL}/api/jogadores/${userId}`);
      const dataUser = await resUser.json();

      const resPontos = await fetch(`${API_URL}/api/jogadores/${userId}/pontos-total`);
      const dataPontos = await resPontos.json();

      setUser({
        id: userId,
        nome: dataUser.nome || "Usuário",
        pontos: dataPontos.success ? dataPontos.totalFinal : 0,
        avatar_url: dataUser.avatar_url ? `${API_URL}${dataUser.avatar_url}` : null
      });
    } catch (err) {
      console.log("Erro:", err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUserAndPontos();
    }, [])
  );

  // Carregar perguntas
  useEffect(() => {
    async function loadQuiz() {
      try {
        const attemptRes = await fetch(`${API_URL}/api/quizzes/${jogador_id}/quiz/${quiz}`);
        const attemptData = await attemptRes.json();
        if (attemptData.attempts >= 2) setCanPlay(false);

        const res = await fetch(`${API_URL}/api/quizzes/${quiz}/questions`);
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.log("Erro ao carregar quiz:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, []);

  const selectAnswer = (qIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
    if (warning) setWarning(false);
  };

  const handleSubmit = async () => {
    if (questions.some((_, idx) => selectedAnswers[idx] === undefined)) {
      setWarning(true);
      setTimeout(() => setWarning(false), 3000);
      return;
    }

    const respostasArray = questions.map((_, idx) => ["A","B","C","D"][selectedAnswers[idx]]);

    try {
      const res = await fetch(`${API_URL}/api/quizzes/${quiz}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogador_id: Number(jogador_id), respostas: respostasArray }),
      });

      const data = await res.json();
      if (!data.success) return;

      setScore(data.score);
      setAttempt(data.attempt);
      setModalVisible(true);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#278148" style={{ flex:1, marginTop:50 }} />;

  // ==========================
  // MENU (IDÊNTICO AO DA HOME)
  // ==========================
  const MenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={22} color="#000" />
      <Text style={styles.menuItemText}>{label}</Text>
    </TouchableOpacity>
  );

  const SideMenu = ({ onClose }) => (
    <View style={styles.menuOverlay}>
      <TouchableOpacity style={styles.menuBackground} onPress={onClose} />
      <View style={styles.sideMenu}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.menuHeader}>Menu de Atividades</Text>

        <MenuItem icon="home" label="Home" onPress={() => { router.push("/home"); onClose(); }} />
        <MenuItem icon="trophy" label="Desafios" onPress={() => { router.push("/desafios"); onClose(); }} />
        <MenuItem icon="newspaper" label="Notícias" onPress={() => { router.push("/noticias"); onClose(); }} />
        <MenuItem icon="logout" label="Sair" onPress={() => { AsyncStorage.removeItem("user"); router.push("/login"); }} />
      </View>
    </View>
  );

  // ==========================

  return (
    <View style={{ flex:1 }}>

      {/* HEADER */}
      <LinearGradient colors={GRADIENT_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={() => setSideMenuVisible(true)}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={60} color="#fff" />
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.username}>{user.nome}</Text>
            <Text style={styles.pointsText}>{user.pontos} pontos</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {sideMenuVisible && <SideMenu onClose={() => setSideMenuVisible(false)} />}

      {/* CONTEÚDO */}
      <ScrollView contentContainerStyle={styles.container}>

        {!canPlay && (
          <View style={styles.completedCard}>
            <MaterialCommunityIcons name="check-decagram" size={45} color="#278148" />
            <Text style={styles.completedTitle}>Quiz Concluído!</Text>
            <Text style={styles.completedText}>Você já completou este quiz 2 vezes.</Text>
            <Text style={styles.completedText}>Tente outro desafio! 🎯</Text>
          </View>
        )}

        {warning && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>⚠️ Responda todas as perguntas antes de enviar!</Text>
          </View>
        )}

        {questions.length === 0 && <Text style={styles.loading}>Nenhuma pergunta disponível 😥</Text>}

        {canPlay && questions.map((q, qIndex) => (
          <View key={qIndex} style={styles.questionCard}>
            <Text style={styles.questionText}>{qIndex + 1}. {q.question}</Text>

            {q.options.map((option, oIndex) => {
              const isSelected = selectedAnswers[qIndex] === oIndex;

              return (
                <TouchableOpacity
                  key={oIndex}
                  style={[styles.optionButton, isSelected && styles.selectedOption]}
                  onPress={() => selectAnswer(qIndex, oIndex)}
                >
                  <Text style={styles.optionText}>{option.startsWith("~") ? option.slice(1) : option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {canPlay && questions.length > 0 && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Enviar Resposta</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Parabéns! 🎉</Text>
            <Text style={styles.modalText}>Você concluiu o quiz.</Text>
            <Text style={styles.modalText}>Sua pontuação: {score}</Text>
            <Text style={styles.modalText}>Tentativa: {attempt} / 2</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                router.push("/home");
              }}
            >
              <Text style={styles.closeTextModal}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ==========================
// ESTILOS
// ==========================
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F9F9F9", paddingBottom:40 },

  header: {
    height: 140,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    elevation: 6,
    zIndex: 10,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },

  avatar: { width: 60, height: 60, borderRadius: 30 },
  username: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  pointsText: { color: "#fff", marginTop: 4 },

  /* MENU */
  menuOverlay: { position:"absolute", top:0,left:0,right:0,bottom:0, backgroundColor:"rgba(0,0,0,0.4)", zIndex:50 },
  menuBackground: { flex:1 },
  sideMenu: { position:"absolute", top:0,bottom:0,width:280, backgroundColor:"#FFF", padding:25 },
  menuHeader: { fontSize:22, fontWeight:"bold", marginBottom:20, color:"#278148" },
  menuItem: { flexDirection:"row", alignItems:"center", marginBottom:18 },
  menuItemText: { marginLeft:12, fontSize:16, fontWeight:"bold", color:"#000" },
  closeButton: { alignSelf:"flex-end" },
  closeTextModal: { fontSize:16, fontWeight:"bold", color:"#fff" },

  /* CARD BONITO */
  completedCard: {
    backgroundColor: "#E9F7EF",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#278148",
    marginTop: 10,
    marginBottom: 5,
  },
  completedText: {
    fontSize: 16,
    color: "#3C3C3C",
    textAlign: "center",
  },

  questionCard: { backgroundColor: "#E0F0FF", borderRadius: 12, padding: 15, marginBottom: 15 },
  questionText: { fontSize: 16, marginBottom: 10 },
  optionButton: { backgroundColor: "#CFE6FF", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 15, marginBottom: 8 },
  selectedOption: { backgroundColor: "#80C1FF" },
  optionText: { fontSize: 16 },

  submitButton: { backgroundColor: "#278148", paddingVertical: 15, borderRadius: 25, alignItems: "center", marginTop: 20 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 18 },

  warningCard: { backgroundColor: "#FFCDD2", padding: 12, borderRadius: 10, marginBottom: 10 },
  warningText: { color: "#B00020", fontWeight: "bold", textAlign: "center" },

  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", backgroundColor: "#fff", borderRadius: 20, padding: 25, alignItems: "center" },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#278148" },
  modalText: { fontSize: 18, marginBottom: 10 },
});

