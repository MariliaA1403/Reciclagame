import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://localhost:3000"; // ou sua URL do servidor

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
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('jogador_id', String(data.user.id));
        await AsyncStorage.setItem('user_tipo', data.user.tipo);

        if (data.user.tipo === "instituicao") {
          await AsyncStorage.setItem('instituicao_id', String(data.user.id));
        }

        if (data.user.tipo === "jogador") {
          router.push('/home');
        } else if (data.user.tipo === "instituicao") {
          router.push('/home-instituicao');
        }
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
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.welcomeText}>Bem vindo(a) ao ReciclaGame!</Text>
        <Text style={styles.subtitleText}>Transforme o lixo em conquistas!</Text>

        <Text style={styles.label}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email ou matrícula"
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

        {/* Botão "Esqueci a senha" */}
        <TouchableOpacity onPress={() => router.push('/recuperar-senha')}>
          <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>Ainda não tem uma conta? Crie agora!</Text>
        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/cadastro')}>
          <Text style={styles.registerButtonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: { 
    width: '100%', 
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
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
  welcomeText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#278148', 
    textAlign: 'center', 
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: { 
    fontSize: 16, 
    fontStyle: 'italic', 
    color: '#000',
    marginBottom: 25, 
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  label: { 
    fontSize: 16, 
    fontStyle: 'italic', 
    color: '#000', 
    marginBottom: 8, 
    alignSelf: 'flex-start' 
  },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 12, 
    marginBottom: 15, 
    borderRadius: 10, 
    backgroundColor: '#F3F3F3',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: '#278148',
    fontSize: 14,
    marginBottom: 15,
    textDecorationLine: 'underline'
  },
  button: { 
    width: '100%', 
    backgroundColor: '#28a745', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  registerText: { 
    fontSize: 14, 
    fontStyle: 'italic', 
    color: '#000', 
    marginTop: 20, 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  registerButton: { 
    width: '100%', 
    backgroundColor: '#28a745', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 3,
  },
  registerButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});
