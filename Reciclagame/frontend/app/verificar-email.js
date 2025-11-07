import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function VerificarEmail() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifique seu email</Text>
      <Text style={styles.subtitle}>
        Enviamos um link de verificação para o seu email. Por favor, confira sua caixa de entrada.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FCFDFD' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#278148', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#000', marginBottom: 30, textAlign: 'center' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

// Remover o header no Expo Router
VerificarEmail.getLayout = (page) => (
  <Stack.Screen options={{ headerShown: false }}>
    {page}
  </Stack.Screen>
);
