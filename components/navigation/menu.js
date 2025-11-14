import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
    Dimensions,
    StatusBar,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';

const HEADER_HEIGHT = 70;
const SCREEN_WIDTH = Dimensions.get('window').width;

const COLLEGE_COLORS = {
    PRIMARY_RED: '#E83E4C',
    ACCENT_BLUE: '#49B6CC',
    TEXT_DARK: '#333333',
    TEXT_LIGHT: '#999999',
    WHITE: '#FFFFFF',
    LIGHT_GRAY: '#F5F5F5',
    PROFILE_CIRCLE: '#DDDDDD',
    BORDER_LIGHT: '#E0E0E0',
};

/* --- FUNCIÓN PRINCIPAL DEL COMPONENTE HEADER --- */

export default function Header() {
    const router = useRouter();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

  

    const handleToggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    const handleGoToLogin = async () => {
        setIsMenuVisible(false); // Cierra el menú

        // FUNCIÓN DE LOGOUT: Limpia el token al navegar
        await AsyncStorage.removeItem("moodleToken");
        await AsyncStorage.removeItem("lastLoggedInUsername");

        router.push('/auth/Login'); // Navega a la ruta de Login
    };

    const handleGoToNotifications = () => {
        console.log("Navegar a Notificaciones");
        // Aquí puedes agregar la lógica de navegación real, por ejemplo:
        // router.push('/notifications');
        Alert.alert("Notificaciones", "La vista de Notificaciones aún no está implementada.");
    };

    const handleGoToCourses = () => {
        setIsMenuVisible(false);
        console.log("Navegar a Mis Cursos");

        router.push('/auth/course');
    };

     const handleGoToindex = () => {
        setIsMenuVisible(false);
        console.log("Navegar a Mis Cursos");

        router.push('/');
    }

    return (
        <View style={{ zIndex: 100 }}>
            {/* I. BARRA DE ENCABEZADO */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton} onPress={handleToggleMenu}>
                    <Text style={styles.headerIconText}><Entypo name="menu" size={34} color="white" /></Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>college</Text>

                <TouchableOpacity style={styles.notificationButton} onPress={handleGoToNotifications}>
                    <Text style={styles.headerIconText}><FontAwesome name="bell" size={24} color="white" /></Text>
                </TouchableOpacity>
            </View>

            {/* II. MENÚ DESPLEGABLE (Flotante) */}
            {isMenuVisible && (
                <TouchableOpacity
                    style={styles.menuOverlay}
                    onPress={() => setIsMenuVisible(false)}
                    activeOpacity={1}
                >
                    <View style={styles.dropdownMenu}>

                        {/* Opción 1: Logout (Cerrar Sesión) */}
                        <TouchableOpacity style={styles.menuItem} onPress={handleGoToLogin}>
                            <Text style={styles.menuItemText}>
                                Cerrar Sesión
                            </Text>
                            <Text style={styles.menuIconText}>
                                🚪
                            </Text>
                        </TouchableOpacity>

                        {/* Opción 2: Cursos */}
                        <TouchableOpacity style={styles.menuItem} onPress={handleGoToCourses}>
                            <Text style={styles.menuItemText}>Mis Cursos</Text>
                            <Text style={styles.menuIconText}>📖</Text>
                        </TouchableOpacity>
                        {/* Opción 3: Inicio */}
                        <TouchableOpacity style={styles.menuItem} onPress={handleGoToindex}>
                            <Text style={styles.menuItemText}>Inicio</Text>
                            <Text style={styles.menuIconText}>🏠</Text>
                        </TouchableOpacity>

                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}



const styles = StyleSheet.create({

    /* I. HEADER */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: SCREEN_WIDTH,
        marginHorizontal: 0,
        paddingHorizontal: 15,
        paddingVertical: 10,
        height: HEADER_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        zIndex: 100,
        backgroundColor: COLLEGE_COLORS.PRIMARY_RED, // Se agrega color para que se vea
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLLEGE_COLORS.WHITE,
    },
    headerIconText: {
        fontSize: 20,
        color: COLLEGE_COLORS.WHITE,
        lineHeight: 24,
    },
    menuButton: {
        padding: 5,
    },
    notificationButton: {
        padding: 5,
    },

    /* II. MENÚ DESPLEGABLE */
    menuOverlay: {
        position: 'absolute',
        top: HEADER_HEIGHT, 
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 99,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 0,
        left: 10,
        width: SCREEN_WIDTH * 0.55,
        backgroundColor: COLLEGE_COLORS.WHITE,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 10,
        paddingVertical: 5,
        overflow: 'hidden',
    },
    menuItem: {
        paddingVertical: 14,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: COLLEGE_COLORS.TEXT_DARK,
        fontWeight: '600',
    },
    menuIconText: {
        fontSize: 20,
        color: COLLEGE_COLORS.TEXT_DARK,
    },
});