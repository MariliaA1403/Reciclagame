import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CentralConta() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.user) {
      const parsedUser = JSON.parse(params.user);
      setUserData(parsedUser);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#278148" />
        <Text style={{ marginTop: 10 }}>Carregando dados...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar os dados do usuário.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* FOTO DO PERFIL */}
      <Image
        source={
          userData.foto
            ? { uri: userData.foto }
            : { uri: "https://via.placeholder.com/150" } // imagem padrão
        }
        style={styles.photo}
      />

      {/* NOME */}
      <Text style={styles.name}>{userData.nome}</Text>

      {/* INFORMAÇÕES */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>📌 Matrícula:</Text>
        <Text style={styles.value}>{userData.matricula}</Text>

        <Text style={styles.label}>🎂 Data de Nascimento:</Text>
        <Text style={styles.value}>{userData.data_nascimento}</Text>

        <Text style={styles.label}>📞 Telefone:</Text>
        <Text style={styles.value}>{userData.telefone}</Text>

        <Text style={styles.label}>🏠 Endereço:</Text>
        <Text style={styles.value}>{userData.endereco}</Text>

        <Text style={styles.label}>🏫 Instituição:</Text>
        <Text style={styles.value}>{userData.instituicao}</Text>

        <Text style={styles.label}>📧 Email:</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      {/* BOTÃO DE EDITAR */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: "/editar-conta",
            params: { user: JSON.stringify(userData) },
          })
        }
      >
        <Text style={styles.editButtonText}>Editar dados</Text>
      </TouchableOpacity>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FCFDFD",
    alignItems: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    color: "red",
    fontSize: 18,
  },

  photo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#ccc",
    marginBottom: 15,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#278148",
    marginBottom: 20,
  },

  infoBox: {
    width: "100%",
    backgroundColor: "#EEEEEE",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },

  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },

  value: {
    fontSize: 16,
    color: "#333",
  },

  editButton: {
    backgroundColor: "#278148",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  editButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
