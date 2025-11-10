// app/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

// Si usas el tema/colores, mantén los imports
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Oculta el header por defecto
        contentStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
        }
      }}>
      
      {/* 1. Ruta del Login (index.js). */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      
      {/* 2. Grupo de Pestañas. */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      
      {/* 3. Otras rutas como modals, si existen */}
      <Stack.Screen 
        name="modal" 
        options={{ presentation: 'modal' }} 
      />

    </Stack>
  );
}