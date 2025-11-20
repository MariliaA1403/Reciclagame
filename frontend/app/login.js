import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = "https://api-reciclagame.vercel.app";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha email e senha.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Enviando dados do usuário para a Home
        router.push({
          pathname: '/home',
          params: { user: JSON.stringify(data.user) }
        });
      } else {
        Alert.alert("Erro", data.message);
      }
    } catch (err) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Digite seu email para recuperar a senha.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      Alert.alert('Esqueceu a senha', data.message);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.welcomeText}>Bem vindo(a) ao ReciclaGame!</Text>
        <Text style={styles.subtitleText}>Transforme o lixo em conquistas!</Text>

        <Text style={styles.label}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email institucional ou pessoal"
          placeholderTextColor="#999999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <Text style={styles.socialText}>ou faça login usando</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity>
            <Image source={require('../assets/images/google.png')} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../assets/images/facebook.png')} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../assets/images/apple.png')} style={styles.socialIcon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.registerText}>Ainda não tem uma conta? Crie agora!</Text>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/cadastro')}
        >
          <Text style={styles.registerButtonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  container: { width: '100%', alignItems: 'center', padding: 20, backgroundColor: '#FCFDFD' },
  logo: { width: 200, height: 200, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#278148', textAlign: 'center', marginBottom: 5 },
  subtitleText: { fontSize: 16, fontStyle: 'italic', color: '#000', marginBottom: 25, textAlign: 'center' },
  label: { fontSize: 16, fontStyle: 'italic', color: '#000', marginBottom: 8, alignSelf: 'flex-start' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 10, backgroundColor: '#DDDDDD' },
  button: { width: '100%', backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  forgotText: { color: '#007bff', textAlign: 'center', fontSize: 14, marginBottom: 15 },
  socialText: { fontSize: 14, fontStyle: 'italic', color: '#000', marginBottom: 10 },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '60%', marginBottom: 15 },
  socialIcon: { width: 50, height: 50, borderRadius: 25 },
  registerText: { fontSize: 14, fontStyle: 'italic', color: '#000', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  registerButton: { width: '100%', backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
