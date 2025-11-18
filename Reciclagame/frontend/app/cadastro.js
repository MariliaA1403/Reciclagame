import { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, Pressable 
} from 'react-native';
import { useRouter } from 'expo-router';

// URL do backend
const API_URL = "https://ubiquitous-lamp-69r6gv49x4qqc555p-3000.app.github.dev";

export default function Login() {
  const router = useRouter();

  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!matricula || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    const email = `${matricula}@reciclagame.com`; // email automático do jogador

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso!", data.message);
        router.push('/home'); // redireciona para a home depois do login
      } else {
        Alert.alert("Erro", data.message || "Falha no login.");
      }

    } catch (error) {
      console.log("💥 ERRO AO CONECTAR:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login ReciclaGame</Text>

      <TextInput
        style={styles.input}
        placeholder="Matrícula"
        placeholderTextColor="#999"
        value={matricula}
        onChangeText={setMatricula}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  input: { width: '100%', padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 10 },
  button: { width: '100%', backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
