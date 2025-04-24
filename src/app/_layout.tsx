import React from 'react';
import { AuthProvider } from "./authContexts"; // <-- AJUSTE ESTE CAMINHO!!!
import { Stack } from 'expo-router';

// Este é o Layout Raiz da sua aplicação
export default function RootLayout() {
  return (
    // 1. AuthProvider envolve toda a navegação
    <AuthProvider>
      {/* 2. Define o tipo de navegador principal (Stack, Tabs, etc.) */}
      {/* Stack é um navegador baseado em pilha (telas empilhadas) */}
      <Stack
        screenOptions={{
          headerShown: false, // Opcional: Esconde o header padrão em todas as telas
        }}
      >
        {/* O Expo Router automaticamente encontrará suas telas (arquivos)
            dentro da pasta 'app/' e as renderizará dentro deste Stack.
            Você pode opcionalmente definir telas específicas aqui se precisar
            de configurações especiais, mas geralmente não é necessário para
            todas elas. */}

        {/* Exemplo de como configurar uma tela específica, se necessário: */}
        {/* <Stack.Screen name="index" options={{ title: 'Login' }} /> */}
        {/* <Stack.Screen name="(tabs)" options={{ title: 'Principal' }} /> */}

      </Stack>
    </AuthProvider>
  );
}