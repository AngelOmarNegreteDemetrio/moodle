import { Drawer } from 'expo-router/drawer';
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { ThemeProvider, useTheme } from '../app/context/themeContext';
import MenuContent, { CustomHeader } from '../components/navigation/menu';
import '../language/i18n';

function AppWrapper() {
    const { theme, isDark } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} /> 
            
            <Drawer
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
                        headerShown: false, 
                        drawerItemStyle: { display: 'none' }
                    }} 
                />

                <Drawer.Screen 
                    name="auth/messages" 
                    options={{ 
                        title: 'Mensajes', 
                        drawerItemStyle: { display: 'none' }
                    }} 
                />

                <Drawer.Screen 
                    name="auth/chatDetail" 
                    options={{ 
                        title: 'Chat', 
                        headerShown: false,
                        drawerItemStyle: { display: 'none' }
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