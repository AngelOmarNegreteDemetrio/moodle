// app/_layout.tsx

import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* 1. La pantalla de login/index.js (la ruta '/') va primero */}
      <Stack.Screen 
        name="index" // Se refiere a app/index.js (tu Login)
        options={{
          headerShown: false, // Oculta la barra de título superior
        }} 
      />
      
      {/* 2. El grupo de pestañas se carga SÓLO después de iniciar sesión */}
      <Stack.Screen 
        name="(tabs)" // Se refiere a la carpeta (tabs)
        options={{ 
          headerShown: false, 
          // Aquí puedes añadir alguna transición personalizada si lo deseas
        }} 
      />
      
      {/* 3. Cualquier otra pantalla de navegación (como modal.tsx) */}
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}