// app/_layout.tsx

import { Drawer } from 'expo-router/drawer';
import { StatusBar } from "expo-status-bar";
import React from 'react';

// 🛑 CORRECCIÓN: Importamos AMBOS componentes del mismo archivo 'menu'
// MenuContent es la exportación por defecto. CustomHeader es la exportación nombrada.
import MenuContent, { CustomHeader } from '../components/navigation/menu';


export default function MainLayout() {
  return (
    <>
      <StatusBar style="light" /> 
      
      <Drawer
        // Pasamos la referencia de la función para el contenido del Drawer
        drawerContent={MenuContent}
        
        // 🛑 screenOptions DEBE SER UNA FUNCIÓN PARA ACCEDER A 'navigation'
        screenOptions={({ navigation }) => ({
          
          // 1. Mantenemos 'true' para que el Drawer nos permita reemplazar el header
          headerShown: true, 
          
          // 2. 🛑 FORZAMOS AL DRAWER A USAR TU COMPONENTE DE BARRA ROJA COMPLETO
          // Usamos la prop 'header' para inyectar tu CustomHeader
          header: () => (
            // CustomHeader es el componente que tiene el estilo rojo, el título, y la campana.
            <CustomHeader onMenuPress={() => navigation.toggleDrawer()} />
          ),
          
          drawerType: 'slide', 
          drawerStyle: { width: '75%' },
        })}
      >
        {/* Las rutas no necesitan headerRight ni title, ya que CustomHeader lo maneja todo */}
        <Drawer.Screen 
          name="index" 
          options={{ 
            title: 'College', 
          }} 
        />
        <Drawer.Screen 
          name="auth/course" 
          options={{ 
            title: 'Mis Cursos', 
          }} 
        />
        
      </Drawer>
    </>
  );
}