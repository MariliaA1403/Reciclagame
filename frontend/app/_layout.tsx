import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// ❌ Remover completamente o anchor das tabs
export const unstable_settings = {};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 👉 Defina APENAS as telas que você realmente tem */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="desafios" options={{ headerShown: false }} />
        <Stack.Screen name="verificar-email" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="quizzes" options={{ headerShown: false }} />
        <Stack.Screen name="noticias" options={{ headerShown: false }} />
        <Stack.Screen name="central-conta" options={{ headerShown: false }} />
        <Stack.Screen name="favoritos" options={{ headerShown: false }} />
        <Stack.Screen name="avaliar-envio" options={{ headerShown: false }} />
        <Stack.Screen name="home-instituicao" options={{ headerShown: false }} />
        <Stack.Screen name="perfil-jogador/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="avaliar-desafio" options={{ headerShown: false }} />
        <Stack.Screen name="participar-desafio" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/[quiz]" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/play/[quiz]" options={{ headerShown: false }} />
        <Stack.Screen name="recuperar-senha" options={{ headerShown: false }} />
        <Stack.Screen name="sobre" options={{ headerShown: false }} />

        {/* Modal (opcional) */}
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
