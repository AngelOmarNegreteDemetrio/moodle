import { Drawer } from 'expo-router/drawer';
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Importar el hook

// IMPORTACIÓN DEL MOTOR DE IDIOMAS
import '../language/i18n';

import { ThemeProvider, useTheme } from '../app/context/themeContext';
import MenuContent, { CustomHeader } from '../components/navigation/menu';

function AppWrapper() {
    const { theme, isDark } = useTheme();
    const { i18n } = useTranslation(); // 2. Obtener la instancia de i18n

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} /> 
            
            <Drawer
                key={i18n.language} // 3. CLAVE VITAL: Esto fuerza el refresco visual del menú
                drawerContent={(props) => <MenuContent {...props} />}
                
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
                <Drawer.Screen 
                    name="auth/Login" 
                    options={{ 
                        headerShown: false, 
                        title: 'Iniciar Sesión',
                        drawerItemStyle: { display: 'none' } 
                    }} 
                />
                
                <Drawer.Screen 
                    name="index" 
                    options={{ title: 'College' }} 
                />
                
                <Drawer.Screen 
                    name="auth/course" 
                    options={{ title: 'Mis Cursos' }} 
                />
                
                <Drawer.Screen 
                    name="auth/testScreen" 
                    options={{ title: 'Mi Rol' }} 
                />
                
                <Drawer.Screen 
                    name="auth/courseDetail" 
                    options={{ 
                        title: 'Detalle del Curso', 
                        headerShown: false,
                    }} 
                />

                <Drawer.Screen 
                    name="auth/language" 
                    options={{ 
                        title: 'Idioma',
                        drawerItemStyle: { display: 'none' }
                    }} 
                />
            </Drawer>
        </>
    );
}

export default function MainLayout() {
    return (
        <ThemeProvider>
            <AppWrapper />
        </ThemeProvider>
    );
}