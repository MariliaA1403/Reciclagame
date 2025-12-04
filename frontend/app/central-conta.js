import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function CentralConta() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const raw = await AsyncStorage.getItem("user");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setUser(parsed);
      setNome(parsed.nome || "");
      setEmail(parsed.email || "");
      setTelefone(parsed.telefone || "");
      setEndereco(parsed.endereco || "");

      if (parsed.data_nascimento) {
        const d = new Date(parsed.data_nascimento);
        const formatted = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
        setDataNascimento(formatted);
      }
    }
    loadUser();
  }, []);

  const updateUser = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const payload = { nome, email, telefone, endereco };
      console.log("Enviando atualização:", payload);

      const res = await fetch(
        `https://backend-reciclagame.vercel.app/jogadores/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const status = res.status;
      const text = await res.text();
      console.log("Status:", status, "Resposta:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, message: "Resposta inválida do servidor" };
      }

      if (data.success) {
        Alert.alert("Sucesso", "Dados atualizados!");
        setUser(data.jogador);
        await AsyncStorage.setItem("user", JSON.stringify(data.jogador));
        setEditMode(false);
      } else {
        Alert.alert("Erro", data.message || "Não foi possível atualizar os dados.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao atualizar usuário.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Text>Carregando...</Text>;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("home")}>
          <Text style={styles.headerBack}>{"< Voltar"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Conta</Text>
      </View>

      {/* Avatar com inicial do nome */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{nome[0]?.toUpperCase() || "?"}</Text>
        </View>
      </View>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} editable={editMode} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} editable={editMode} />

      <Text style={styles.label}>Telefone</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} editable={editMode} />

      <Text style={styles.label}>Endereço</Text>
      <TextInput style={styles.input} value={endereco} onChangeText={setEndereco} editable={editMode} />

      <Text style={styles.label}>Data de Nascimento</Text>
      <TextInput style={styles.input} value={dataNascimento} editable={false} />

      <TouchableOpacity
        style={editMode ? styles.saveButton : styles.editButton}
        onPress={editMode ? updateUser : () => setEditMode(true)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{editMode ? "Salvar" : "Editar Informações"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9" },
  label: { fontWeight: "bold", marginBottom: 5, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  avatarContainer: { alignItems: "center", marginBottom: 25 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 48, fontWeight: "bold" },
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerBack: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
});
