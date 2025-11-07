import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.5; 

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      <View style={styles.semiCircleWrapper}>
        <LinearGradient
          colors={['#C9DFC9', '#95C296']}
          style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            position: 'absolute',
            top: -CIRCLE_SIZE / 2, 
          }}
        />
      </View>

      
      <Text style={styles.title}>Bem-vindo(a) ao ReciclaGame!</Text>
      <Text style={styles.subtitle}>Transforme o lixo em conquistas!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => router.push('/cadastro')}
      >
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFDFD', 
  },

  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  semiCircleWrapper: {
    width: '100%',
    height: CIRCLE_SIZE / 2, 
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#278148',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },

  button: {
    width: '100%',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },

  registerButton: {
    backgroundColor: '#95C296',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
