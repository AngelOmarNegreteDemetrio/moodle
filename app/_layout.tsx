// app/_layout.tsx

import { Drawer } from 'expo-router/drawer';
import { StatusBar } from "expo-status-bar";
import React from 'react';

import { ThemeProvider, useTheme } from '../app/context/themeContext';
import MenuContent, { CustomHeader } from '../components/navigation/menu';


// Componente Wrapper para acceder al tema
function AppWrapper() {
    // Obtenemos theme y isDark
    const { theme, isDark } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} /> 
            
            <Drawer
                drawerContent={MenuContent}
                
                screenOptions={({ navigation }) => ({
                    
                    headerShown: true, 
                    
                    // CAMBIO CRÍTICO AQUÍ: Llamamos a CustomHeader sin pasarle las props de tema
                    header: () => (
                        <CustomHeader 
                            // Solo pasamos funciones de navegación si las usas internamente
                            onMenuPress={() => navigation.toggleDrawer()} 
                            // NO PASAR theme ni isDark. CustomHeader las obtiene internamente.
                        />
                    ),
                    
                    drawerType: 'slide', 
                    drawerStyle: { 
                        width: '75%',
                        // El fondo del menú lateral usa el color del tema
                        backgroundColor: theme.menuBackground,
                    },
                    // Asegura que el fondo de la pantalla cambie
                    sceneContainerStyle: {
                        backgroundColor: theme.background,
                    }
                })}
            >
                {/* Rutas existentes (sin cambios) */}
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
                <Drawer.Screen 
                    name="auth/TestScreen" 
                    options={{ 
                        title: 'Mi Rol', 
                    }} 
                />
                <Drawer.Screen 
                    name="auth/courseDetail" 
                    options={{ 
                        title: 'Detalle del Curso', 
                        // 🚨 ¡CAMBIO IMPLEMENTADO! Oculta el encabezado del Drawer/CustomHeader.
                        headerShown: false,
                    }} 
                />
                
            </Drawer>
        </>
    );
}


// El Layout principal ENGLOBA toda la aplicación con el ThemeProvider
export default function MainLayout() {
    return (
        <ThemeProvider>
            <AppWrapper />
        </ThemeProvider>
    );
}