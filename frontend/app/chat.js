import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://backend-reciclagame.vercel.app"; 

export default function Chat() {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [userId, setUserId] = useState(null);
  const [userTipo, setUserTipo] = useState(null);
  const [instituicaoId, setInstituicaoId] = useState(null);
  const [menuMensagem, setMenuMensagem] = useState(null);
  const [editarTexto, setEditarTexto] = useState("");

  const scrollViewRef = useRef();

  // Carregar dados do AsyncStorage
  useEffect(() => {
    async function loadUser() {
      const raw = await AsyncStorage.getItem("user");
      const tipo = await AsyncStorage.getItem("user_tipo");
      const instId = await AsyncStorage.getItem("instituicao_id");

      if (raw && tipo) {
        const parsed = JSON.parse(raw);
        setUserId(parsed.id);
        setUserTipo(tipo);
        setInstituicaoId(instId || parsed.instituicao_id);
      }
    }
    loadUser();
  }, []);

  // Buscar mensagens a cada 2s
  useEffect(() => {
    if (!instituicaoId) return;
    const interval = setInterval(buscarMensagens, 2000);
    return () => clearInterval(interval);
  }, [instituicaoId]);

  const buscarMensagens = async () => {
    if (!instituicaoId) return;
    try {
      const res = await fetch(`${API_URL}/chat/${instituicaoId}`);
      const data = await res.json();
      if (data.success) setMensagens(data.mensagens);
    } catch (err) {
      console.error(err);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !userId || !instituicaoId) return;
    try {
      const res = await fetch(`${API_URL}/chat/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jogador_id: userTipo === "jogador" ? userId : null,
          instituicao_id: userTipo === "instituicao" ? userId : instituicaoId,
          mensagem: novaMensagem.trim(),
          enviado_por: userTipo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNovaMensagem("");
        buscarMensagens();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const abrirMenuMensagem = (msg) => {
    if (
      (msg.enviado_por === "jogador" && userTipo === "jogador" && msg.jogador_id === userId) ||
      (msg.enviado_por === "instituicao" && userTipo === "instituicao" && msg.instituicao_id === userId)
    ) {
      setMenuMensagem(msg);
      setEditarTexto(msg.mensagem);
    }
  };

  const excluirMensagem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/chat/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMenuMensagem(null);
        buscarMensagens();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const salvarEdicao = async () => {
    if (!menuMensagem || !editarTexto.trim()) return;

    try {
      const res = await fetch(`${API_URL}/chat/editar/${menuMensagem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: editarTexto.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMenuMensagem(null);
        setEditarTexto("");
        buscarMensagens();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatarData = (isoString) => {
    const data = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(data);
  };

  const formatarDia = (isoString) => {
    const data = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).format(data);
  };

  let ultimoDia = "";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.mensagensContainer}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: true })
          }
        >
          {mensagens.map((msg) => {
            const diaMensagem = formatarDia(msg.criado_em);
            const exibirSeparador = diaMensagem !== ultimoDia;
            if (exibirSeparador) ultimoDia = diaMensagem;

            const isUsuario =
              (msg.enviado_por === "jogador" && userTipo === "jogador" && msg.jogador_id === userId) ||
              (msg.enviado_por === "instituicao" && userTipo === "instituicao" && msg.instituicao_id === userId);

            return (
              <View key={msg.id}>
                {exibirSeparador && (
                  <View style={styles.separadorDia}>
                    <Text style={styles.textoSeparador}>{diaMensagem}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.mensagem,
                    isUsuario ? styles.mensagemUsuario : styles.mensagemOutro,
                  ]}
                >
                  <View style={styles.textoContainer}>
                    <Text style={styles.textoMensagem}>{msg.mensagem}</Text>
                    {isUsuario && (
                      <TouchableOpacity
                        onPress={() => abrirMenuMensagem(msg)}
                        style={styles.menuButton}
                      >
                        <Text style={styles.menuText}>⋯</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.nome}>
                    {msg.enviado_por === "jogador" ? msg.nome_jogador : msg.nome_instituicao} -{" "}
                    {formatarData(msg.criado_em)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            placeholder="Digite sua mensagem..."
          />
          <TouchableOpacity style={styles.botaoEnviar} onPress={enviarMensagem}>
            <Text style={styles.botaoEnviarTexto}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de editar/excluir */}
      <Modal
        visible={menuMensagem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuMensagem(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Ações</Text>
            <TextInput
              style={styles.modalInput}
              value={editarTexto}
              onChangeText={setEditarTexto}
            />
            <TouchableOpacity
              style={[styles.modalBotao, { backgroundColor: "#4CAF50" }]}
              onPress={salvarEdicao}
            >
              <Text style={{ color: "#fff" }}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBotao, { backgroundColor: "#f44336" }]}
              onPress={() => excluirMensagem(menuMensagem.id)}
            >
              <Text style={{ color: "#fff" }}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBotao, { backgroundColor: "#ccc" }]}
              onPress={() => setMenuMensagem(null)}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  mensagensContainer: { flex: 1, marginBottom: 10 },
  mensagem: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  mensagemUsuario: { backgroundColor: "#42c549ff", alignSelf: "flex-end" },
  mensagemOutro: { backgroundColor: "#808581ff", alignSelf: "flex-start" },
  textoContainer: { flexDirection: "row", alignItems: "center" },
  textoMensagem: { color: "#fff", flex: 1 },
  nome: { fontSize: 12, color: "#eee" },
  menuButton: { paddingHorizontal: 5 },
  menuText: { color: "#fff", fontWeight: "bold", fontSize: 18 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  botaoEnviar: {
    marginLeft: 5,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  botaoEnviarTexto: { color: "#fff", fontWeight: "bold" },

  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 250,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "stretch",
  },
  modalBotao: {
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  separadorDia: {
    alignSelf: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
  textoSeparador: { fontSize: 12, color: "#333" },
});
