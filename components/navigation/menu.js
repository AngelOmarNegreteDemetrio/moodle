import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router'; 
import { COLLEGE_COLORS } from './constants/colors';

// Altura de la cabecera para calcular la posición del menú desplegable
const HEADER_HEIGHT = 60; 
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Menu() { 
    const router = useRouter();
    // Estado para controlar la visibilidad del menú desplegable
    const [isMenuVisible, setIsMenuVisible] = useState(false); 
    
    // Función que abre y cierra el menú
    const handleToggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    // Función para navegar al Login
    const handleGoToLogin = () => {
        setIsMenuVisible(false); // Cierra el menú
        router.push('/auth/Login'); // Navega a la ruta de Login
    };

    return (
        // El Fragment permite devolver múltiples elementos
        <> 
            {/* I. HEADER - FONDO ROJO PRINCIPAL */}
            <View style={[styles.header, { backgroundColor: COLLEGE_COLORS.PRIMARY_RED }]}>
                {/* Botón de Hamburguesa que ahora alterna el estado */}
                <TouchableOpacity style={styles.menuButton} onPress={handleToggleMenu}>
                    <Feather name="menu" size={24} color={COLLEGE_COLORS.WHITE} />
                </TouchableOpacity>

                {/* Logo Central (Usando Text como placeholder de logo) */}
                <Text style={styles.headerTitle}>college</Text>

                {/* Botón de Notificaciones */}
                <TouchableOpacity style={styles.notificationButton}>
                    <Feather name="bell" size={24} color={COLLEGE_COLORS.WHITE} />
                </TouchableOpacity>
            </View>

            {/* II. MENÚ DESPLEGABLE (Flotante) */}
            {isMenuVisible && (
                // El overlay táctil para cerrar el menú al tocar fuera
                <TouchableOpacity 
                    style={styles.menuOverlay} 
                    onPress={() => setIsMenuVisible(false)}
                    activeOpacity={1} // Para que no haya efecto visual al presionar
                >
                    {/* Contenedor real del menú */}
                    <View style={styles.dropdownMenu}>
                        
                        {/* Opción de Login */}
                        <TouchableOpacity style={styles.menuItem} onPress={handleGoToLogin}>
                            <Text style={styles.menuItemText}>Iniciar Sesión</Text>
                            <Feather name="log-in" size={20} color="#333" />
                        </TouchableOpacity>

                        {/* Aquí puedes añadir más opciones (Ej: Perfil, Configuración) */}
                        <TouchableOpacity style={styles.menuItem} onPress={() => {/* otra acción */}}>
                            <Text style={styles.menuItemText}>Perfil</Text>
                            <Feather name="user" size={20} color="#333" />
                        </TouchableOpacity>

                    </View>
                </TouchableOpacity>
            )}
        </>
    );
}

// ... (El StyleSheet se extiende para incluir los estilos del menú flotante)
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: HEADER_HEIGHT,
        zIndex: 10, // Asegura que el header esté encima del contenido normal
    },
    headerTitle: {
        color: COLLEGE_COLORS.WHITE,
        fontSize: 20,
        fontWeight: 'bold',
    },
    menuButton: {
        padding: 5,
    },
    notificationButton: {
        padding: 5,
    },
    
    // --- Estilos para el Menú Flotante ---
    menuOverlay: {
        // Ocupa toda la pantalla para capturar toques fuera del menú
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Un poco de transparencia para indicar que hay un overlay
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        zIndex: 5, // Debe estar debajo del Header (zIndex: 10)
    },
    dropdownMenu: {
        position: 'absolute',
        // Se posiciona justo debajo del botón de hamburguesa
        top: HEADER_HEIGHT, 
        left: 5, // Pequeño margen
        width: SCREEN_WIDTH * 0.5, // Ancho del menú (50% de la pantalla)
        backgroundColor: COLLEGE_COLORS.WHITE,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingVertical: 10,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});