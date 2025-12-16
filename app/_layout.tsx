// app/_layout.tsx

import { Drawer } from 'expo-router/drawer';
import { StatusBar } from "expo-status-bar";
import React from 'react';

import { ThemeProvider, useTheme } from '../app/context/themeContext';
import MenuContent, { CustomHeader } from '../components/navigation/menu';


// Componente Wrapper para acceder al tema
function AppWrapper() {
    const { theme, isDark } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} /> 
            
            <Drawer
                drawerContent={MenuContent}
                
                screenOptions={({ navigation }) => ({
                    
                    headerShown: true, 
                    
                    header: () => (
                        <CustomHeader 
                            onMenuPress={() => navigation.toggleDrawer()} 
                        />
                    ),
                    
                    drawerType: 'slide', 
                    drawerStyle: { 
                        width: '75%',
                        backgroundColor: theme.menuBackground,
                    },
                    sceneContainerStyle: {
                        backgroundColor: theme.background,
                    }
                })}
            >
                {/* RUTA DE LOGIN: Cabecera OCULTA y se omite del menú Drawer */}
                <Drawer.Screen 
                    name="auth/Login" 
                    options={{ 
                        headerShown: false, // Oculta la barra de navegación en Login
                        title: 'Iniciar Sesión',
                        drawerItemStyle: { display: 'none' } // Oculta el enlace del Drawer
                    }} 
                />
                
                {/* Otras rutas */}
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
                    name="auth/testScreen" 
                    options={{ 
                        title: 'Mi Rol', 
                    }} 
                />
                <Drawer.Screen 
                    name="auth/courseDetail" 
                    options={{ 
                        title: 'Detalle del Curso', 
                        headerShown: false, // Cabecera oculta para esta ruta también
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