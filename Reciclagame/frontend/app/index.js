import { useEffect } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={['#C9DFC9', '#95C296']}
      style={styles.container}
    >
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { 
    width: 250,  // aumentei de 200 para 250
    height: 250, // aumentei de 200 para 250
    shadowColor: '#000',          // sombra iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,                 // sombra Android
  },
});

// Remover o header no Expo Router
Splash.getLayout = (page) => (
  <Stack.Screen options={{ headerShown: false }}>
    {page}
  </Stack.Screen>
);
