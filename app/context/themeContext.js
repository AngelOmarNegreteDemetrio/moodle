// context/ThemeContext.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native'; // Para detectar el tema del sistema

// 1. Definimos el Contexto
const ThemeContext = createContext();

// 2. Definimos los Colores (Puedes expandir esta lista)
export const lightTheme = {
    background: '#F5F5F5', // Fondo claro principal
    text: '#1C1C1C',       // Texto oscuro
    primary: '#FF0000',    // Color principal (el rojo de tu header)
    card: '#FFFFFF',       // Fondo de tarjetas/contenedores
    menuBackground: '#FFFFFF', // Fondo del Drawer
};

export const darkTheme = {
    background: '#121212', // Fondo oscuro principal
    text: '#E0E0E0',       // Texto claro
    primary: '#CF6679',    // Un color que destaque en oscuro (puedes mantener el rojo o usar uno más suave)
    card: '#1F1F1F',       // Fondo de tarjetas/contenedores
    menuBackground: '#1C1C1C', // Fondo del Drawer
};

// 3. Proveedor del Contexto
export const ThemeProvider = ({ children }) => {
    // Inicialmente, intenta obtener el tema guardado, o usa la preferencia del sistema
    const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');
    const theme = isDark ? darkTheme : lightTheme;

    // useEffect para cargar la preferencia guardada al inicio
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('userTheme');
                if (storedTheme !== null) {
                    setIsDark(storedTheme === 'dark');
                } else {
                    // Si no hay preferencia, escucha el tema del sistema
                    const systemTheme = Appearance.getColorScheme();
                    setIsDark(systemTheme === 'dark');
                }
            } catch (e) {
                console.warn('Error loading theme:', e);
            }
        };
        loadTheme();
    }, []);

    // Función para cambiar y guardar la preferencia
    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        try {
            await AsyncStorage.setItem('userTheme', newIsDark ? 'dark' : 'light');
        } catch (e) {
            console.warn('Error saving theme:', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 4. Hook personalizado para usar el tema fácilmente
export const useTheme = () => useContext(ThemeContext);