import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = "http://localhost:3000"; // ajuste para sua URL do servidor

export default function RecuperarSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState(''); // jogador ou instituicao
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [emailVerificado, setEmailVerificado] = useState(false);

  // 1️⃣ Verifica se o email existe
  const verificarEmail = async () => {
    if (!email) {
      Alert.alert("Erro", "Digite o email.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/recuperar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailVerificado(true);
        setTipo(data.tipo); // jogador ou instituicao
      } else {
        Alert.alert("Erro", data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  // 2️⃣ Troca a senha
  const trocarSenha = async () => {
    if (!novaSenha || !confirmarSenha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/trocar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: novaSenha }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Sucesso", data.message);
        router.push('/login');
      } else {
        Alert.alert("Erro", data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>

        {/* ===== LOGO SEM SOMBRA ===== */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')} // ajuste o caminho para sua logo
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Recuperar Senha</Text>

        {/* Passo 1: Verificar email */}
        {!emailVerificado && (
          <>
            <Text style={styles.label}>Digite seu email ou matrícula:</Text>
            <TextInput
              style={styles.input}
              placeholder="Email ou matrícula"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={verificarEmail}>
              <Text style={styles.buttonText}>Verificar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Passo 2: Trocar senha */}
        {emailVerificado && (
          <>
            <Text style={styles.label}>Nova Senha:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a nova senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
            />

            <Text style={styles.label}>Confirmar Senha:</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme a senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={trocarSenha}>
              <Text style={styles.buttonText}>Trocar Senha</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { width: '90%', padding: 20 },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
   logo: { 
    width: 200, 
    height: 200, 
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  title: { fontSize: 24, fontWeight: 'bold', color: '#278148', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 10, backgroundColor: '#F3F3F3' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
