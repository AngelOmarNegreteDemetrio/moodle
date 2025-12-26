// context/ThemeContext.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

// 1. Definimos el Contexto
const ThemeContext = createContext();

// 2. Definimos los Colores (AÑADIMOS textSecondary)
export const lightTheme = {
    background: '#F5F5F5',
    text: '#1C1C1C',
    textSecondary: '#666666', // Gris oscuro para descripciones en modo claro
    primary: '#FF0000',
    card: '#FFFFFF',
    menuBackground: '#FFFFFF',
    border: '#E0E0E0', // Añadimos border para consistencia
};

export const darkTheme = {
    background: '#121212',
    text: '#E0E0E0',
    textSecondary: '#A9A9A9', // Gris claro para descripciones en modo oscuro (¡Esto resuelve el problema!)
    primary: '#CF6679',
    card: '#1F1F1F',
    menuBackground: '#1C1C1C',
    border: '#333333', // Añadimos border para consistencia
};

// 3. Proveedor del Contexto (El código interno no necesita cambios, está correcto)
export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');
    const theme = isDark ? darkTheme : lightTheme;

    // ... (rest of useEffect code for loading theme)
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('userTheme');
                if (storedTheme !== null) {
                    setIsDark(storedTheme === 'dark');
                } else {
                    const systemTheme = Appearance.getColorScheme();
                    setIsDark(systemTheme === 'dark');
                }
            } catch (e) {
                console.warn('Error loading theme:', e);
            }
        };
        loadTheme();
    }, []);

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