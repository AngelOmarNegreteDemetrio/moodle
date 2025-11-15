// app/components/navigation/menu.js

import React from 'react';
import { 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    Text,
    Dimensions,
    Alert,
    Platform,
    StatusBar as RNStatusBar, 
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo'; 

const HEADER_HEIGHT = 70;
const SCREEN_WIDTH = Dimensions.get('window').width;

// Paleta de Colores
const COLLEGE_COLORS = {
    PRIMARY_RED: '#E83E4C', 
    BACKGROUND_LIGHT: '#FFFFFF', 
    TEXT_DARK: '#212121', 
    BORDER_LIGHT: '#E0E0E0', 
    LOGOUT_RED: '#D32F2F', 
    ACTIVE_RED: '#E83E4C', 
    WHITE: '#FFFFFF',
};

// ------------------------------------------------------------------
// 🛑 FUNCIÓN 1: EL ENCABEZADO (BARRA ROJA Y CAMPANA)
// 🛑 La exportamos por nombre para usarla en el _layout
// ------------------------------------------------------------------
export function CustomHeader({ onMenuPress }) { 

    const handleGoToNotifications = () => {
        Alert.alert("Notificaciones", "La vista de Notificaciones aún no está implementada.");
    };

    return (
        <View style={{ zIndex: 100 }}>
            {/* BARRA DE ENCABEZADO */}
            <View style={headerStyles.header}>
                
                {/* Botón de Menú: Abre el Drawer */}
                <TouchableOpacity style={headerStyles.menuButton} onPress={onMenuPress}>
                    <Entypo name="menu" size={34} color={COLLEGE_COLORS.WHITE} />
                </TouchableOpacity>

                <Text style={headerStyles.headerTitle}>College</Text>

                {/* Botón de Notificación (Campana) */}
                <TouchableOpacity style={headerStyles.notificationButton} onPress={handleGoToNotifications}>
                    <FontAwesome name="bell" size={24} color={COLLEGE_COLORS.WHITE} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Estilos específicos para el encabezado
const headerStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: SCREEN_WIDTH,
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight + 10 : 10,
        height: HEADER_HEIGHT + (Platform.OS === 'android' ? RNStatusBar.currentHeight : 0),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        zIndex: 100,
        backgroundColor: COLLEGE_COLORS.PRIMARY_RED,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLLEGE_COLORS.WHITE,
    },
    menuButton: { padding: 5, },
    notificationButton: { padding: 5, },
});


// ------------------------------------------------------------------
// 🛑 FUNCIÓN 2: EL CONTENIDO DEL MENÚ (OPCIONES)
// 🛑 La exportamos por defecto para usarla en la prop 'drawerContent'
// ------------------------------------------------------------------
export default function MenuContent(props) {
    const { navigation } = props;
    const router = useRouter(); 

    // Lógica para el estado activo (igual a la anterior)
    const isActive = (routeName) => {
        if (!navigation || !navigation.getState) {
            return false;
        }
        const state = navigation.getState();
        const focusedRoute = state.routes[state.index].name;
        return focusedRoute === routeName;
    };
    
    // Lógica de navegación (igual a la anterior)
    const handleGoToLogin = async () => {
        if (navigation) navigation.closeDrawer(); 
        await AsyncStorage.removeItem("moodleToken");
        await AsyncStorage.removeItem("lastLoggedInUsername");
        router.replace('/auth/Login'); 
    };

    const handleGoToCourses = () => {
        if (navigation) navigation.navigate('auth/course'); 
    };

    const handleGoToindex = () => {
        if (navigation) navigation.navigate('index'); 
    }
    
    // Estilos condicionales
    const activeItemStyle = { backgroundColor: COLLEGE_COLORS.PRIMARY_RED + '15', };
    const activeTextStyle = { color: COLLEGE_COLORS.ACTIVE_RED, fontWeight: '700', };
    const activeIconColor = COLLEGE_COLORS.ACTIVE_RED;

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
            {/* Contenido del menú... (Opciones) */}
            <View style={styles.menuItemsContainer}>

                {/* Opción 1: Inicio */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('index') && activeItemStyle]} 
                    onPress={handleGoToindex}
                    activeOpacity={0.9} 
                >
                    <Text style={[styles.menuItemText, isActive('index') && activeTextStyle]}>
                        Inicio
                    </Text>
                    <Entypo name="home" size={20} color={isActive('index') ? activeIconColor : COLLEGE_COLORS.TEXT_DARK} />
                </TouchableOpacity>
                
                {/* Opción 2: Mis Cursos */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('auth/course') && activeItemStyle]} 
                    onPress={handleGoToCourses}
                    activeOpacity={0.9} 
                >
                    <Text style={[styles.menuItemText, isActive('auth/course') && activeTextStyle]}>
                        Mis Cursos
                    </Text>
                    <FontAwesome name="book" size={20} color={isActive('auth/course') ? activeIconColor : COLLEGE_COLORS.TEXT_DARK} />
                </TouchableOpacity>
                
                <View style={styles.menuSeparator} />

                {/* Opción 3: Cerrar Sesión */}
                <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={handleGoToLogin}
                    activeOpacity={0.8} 
                >
                    <Text style={[styles.menuItemText, { color: COLLEGE_COLORS.LOGOUT_RED }]}>
                        Cerrar Sesión
                    </Text>
                    <Entypo name="log-out" size={20} color={COLLEGE_COLORS.LOGOUT_RED} />
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
}

// Estilos específicos para el contenido del menú
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLLEGE_COLORS.BACKGROUND_LIGHT, },
    menuItemsContainer: { flex: 1, paddingVertical: 4, },
    menuItem: { paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
    menuItemText: { fontSize: 15, color: COLLEGE_COLORS.TEXT_DARK, fontWeight: '500', },
    menuSeparator: { height: 1, backgroundColor: COLLEGE_COLORS.BORDER_LIGHT, marginVertical: 4, marginHorizontal: 10, }
});