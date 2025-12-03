import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // para navegação

const API_URL = "https://backend-reciclagame.vercel.app";

export default function CentralConta() {
  const navigation = useNavigation(); // hook de navegação
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [editMode, setEditMode] = useState(false);

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

      setAvatar(parsed.avatar_url ? `https://backend-reciclagame.vercel.app${parsed.avatar_url}` : null);
    }
    loadUser();
  }, []);

  const updateUser = async () => {
    try {
      const payload = { nome, email, telefone, endereco };
      const res = await fetch(`${API_URL}/jogadores/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Sucesso", "Dados atualizados!");
        setUser(data.jogador);
        await AsyncStorage.setItem("user", JSON.stringify(data.jogador));
        setEditMode(false);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar os dados.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao atualizar usuário.");
    }
  };

  const removeAvatar = async () => {
    Alert.alert("Remover Foto", "Deseja remover a foto do perfil?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/upload-avatar/${user.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
              setAvatar(null);
              const updatedUser = { ...user, avatar_url: null };
              setUser(updatedUser);
              await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            } else {
              Alert.alert("Erro", data.message || "Não foi possível remover o avatar.");
            }
          } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Erro ao remover avatar.");
          }
        },
        style: "destructive",
      },
    ]);
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

      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={{ color: "#fff", fontSize: 32 }}>+</Text>
          </View>
        )}

        <View style={styles.fileContainer}>
          <input type="file" accept="image/*" onChange={async e => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("avatar", file);
            try {
              const res = await fetch(`${API_URL}/upload-avatar/${user.id}`, {
                method: "POST",
                body: formData,
              });
              const data = await res.json();
              if (data.success) {
                setAvatar(`https://backend-reciclagame.vercel.app${data.avatar_url}`);
                const updatedUser = { ...user, avatar_url: data.avatar_url };
                setUser(updatedUser);
                await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
              } else {
                Alert.alert("Erro", data.message || "Erro ao atualizar avatar.");
              }
            } catch (err) {
              console.error(err);
              Alert.alert("Erro", "Erro ao enviar avatar.");
            }
          }} />

          {avatar && (
            <button
              onClick={removeAvatar}
              style={{
                marginLeft: 10,
                padding: 6,
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Remover
            </button>
          )}
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
      >
        <Text style={styles.buttonText}>{editMode ? "Salvar" : "Editar Informações"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
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
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
  },
  fileContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
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
