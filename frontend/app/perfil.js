import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Perfil() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [foto, setFoto] = useState("");

  // ===========================
  // 🔹 Buscar informações do usuário
  // ===========================
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`https://backend-reciclagame.vercel.app/users/${userId}`);
        const data = await response.json();

        setUser(data);
        setNome(data.nome || "");
        setEmail(data.email || "");
        setTelefone(data.telefone || "");
        setFoto(data.foto || "");
      } catch (error) {
        console.log("Erro ao carregar perfil:", error);
      }
    }

    if (userId) fetchUser();
  }, [userId]);

  // ===========================
  // 🔹 Atualizar dados do usuário
  // ===========================
  async function salvarAlteracoes() {
    try {
      const response = await fetch(`https://backend-reciclagame.vercel.app/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          foto,
        }),
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      } else {
        Alert.alert("Erro", "Não foi possível atualizar os dados.");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar alterações.");
    }
  }

  // ===========================
  // 🔹 Escolher imagem da galeria
  // ===========================
  async function escolherFoto() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  }

  // ===========================
  // 🔹 Tela de carregamento
  // ===========================
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Meu Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Foto */}
      <TouchableOpacity onPress={escolherFoto}>
        <Image
          source={{
            uri: foto
              ? foto
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.editPhotoText}>Alterar Foto</Text>
      </TouchableOpacity>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
        />
      </View>

      {/* Botão */}
      <TouchableOpacity style={styles.button} onPress={salvarAlteracoes}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    paddingBottom: 40,
    backgroundColor: "#e8f5e9",
  },

  header: {
    backgroundColor: "#2e7d32",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginTop: 20,
  },

  editPhotoText: {
    textAlign: "center",
    marginTop: 10,
    color: "#1b5e20",
    fontWeight: "bold",
  },

  form: {
    marginTop: 20,
    paddingHorizontal: 20,
  },

  label: {
    color: "#1b5e20",
    fontWeight: "bold",
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: "#c8e6c9",
    borderWidth: 1,
  },

  button: {
    backgroundColor: "#2e7d32",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
