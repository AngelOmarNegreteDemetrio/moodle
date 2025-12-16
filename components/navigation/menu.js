import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '../../app/context/themeContext';

const HEADER_HEIGHT = 70;
const SCREEN_WIDTH = Dimensions.get('window').width;

/* Paleta de Colores base UNIFICADA */
const COLLEGE_COLORS = {
    COLOR_CLARO_COINCIDENTE: '#FF0000', 
    COLOR_OSCURO_COINCIDENTE: '#F55D69', 
    LOGOUT_RED: '#D32F2F', 
    WHITE: '#FFFFFF',
};

// ===========================================
// 1. CUSTOM HEADER (Barra Superior) - SIN CAMBIOS
// ===========================================

export function CustomHeader({ onMenuPress }) { 
    const { isDark } = useTheme(); 
    const navigation = useNavigation();
    
    const headerColor = isDark 
        ? COLLEGE_COLORS.COLOR_OSCURO_COINCIDENTE 
        : COLLEGE_COLORS.COLOR_CLARO_COINCIDENTE; 
    
    const iconColor = COLLEGE_COLORS.WHITE; 

    const handleGoToNotifications = () => {
        Alert.alert("Notificaciones", "La vista de Notificaciones aún no está implementada.");
    };

    return (
        <View style={{ zIndex: 100 }}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={headerColor} 
            />
            
            <View style={[
                headerStyles.header, 
                { backgroundColor: headerColor } 
            ]}>
                
                <TouchableOpacity 
                    style={headerStyles.menuButton} 
                    onPress={onMenuPress || (() => navigation.openDrawer())}
                >
                    <Entypo name="menu" size={34} color={iconColor} />
                </TouchableOpacity>

                <Text style={headerStyles.headerTitle}>College</Text>

                <TouchableOpacity style={headerStyles.notificationButton} onPress={handleGoToNotifications}>
                    <FontAwesome name="bell" size={24} color={iconColor} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLLEGE_COLORS.WHITE,
    },
    menuButton: { padding: 5, },
    notificationButton: { padding: 5, },
});


// ===========================================
// 2. DEFAULT EXPORT (MenuContent del Drawer) - CAMBIOS AQUÍ
// ===========================================

export default function MenuContent(props) {
    const { navigation } = props;
    const router = useRouter(); 
    
    const { theme, isDark, toggleTheme } = useTheme();
    
    const menuActiveColor = isDark 
        ? COLLEGE_COLORS.COLOR_OSCURO_COINCIDENTE 
        : COLLEGE_COLORS.COLOR_CLARO_COINCIDENTE;

    const activeItemStyle = { backgroundColor: menuActiveColor + '15', }; 
    const activeTextStyle = { color: menuActiveColor, fontWeight: '700', };
    const activeIconColor = menuActiveColor;

    const isActive = (routeName) => {
        if (!navigation || !navigation.getState) { return false; }
        const state = navigation.getState();
        // Nota: Si usas Expo Router, el estado de navegación puede ser un poco más complejo. 
        // Simplificamos asumiendo que el nombre de la ruta es lo que estamos buscando.
        const focusedRoute = state.routes[state.index].name;
        return focusedRoute === routeName;
    };
    
    const handleGoToLogin = async () => {
        if (navigation) navigation.closeDrawer(); 
        await AsyncStorage.removeItem("moodleToken");
        await AsyncStorage.removeItem("lastLoggedInUsername");
        router.replace('/auth/Login'); 
    };

    const handleGoToindex = () => { if (navigation) navigation.navigate('index'); }
    const handleGoToCourses = () => { if (navigation) navigation.navigate('auth/course'); };
    const handleGoToTest = () => { if (navigation) navigation.navigate('auth/testScreen'); }
    
    // 🚨 NUEVA FUNCIÓN DE NAVEGACIÓN PARA EL CV
    const handleGoToCV = () => { 
        if (navigation) navigation.navigate('auth/portfolio'); // Asegúrate que esta es la ruta correcta
    } 
    
    const inactiveIconColor = theme.text;
    const inactiveTextStyle = { color: theme.text };
    const separatorColor = isDark ? theme.border : '#E0E0E0'; 

    const switchThumbColor = isDark ? COLLEGE_COLORS.WHITE : '#000000'; 
    const switchTrackColorFalse = isDark ? theme.card : '#F0F0F0';
    const switchTrackColorTrue = menuActiveColor;

    return (
        <DrawerContentScrollView 
            {...props} 
            contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        > 
            <View style={styles.menuItemsContainer}>

                {/* --- ITEMS DE NAVEGACIÓN --- */}
                
                {/* INICIO */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('index') && activeItemStyle]} 
                    onPress={handleGoToindex}
                    activeOpacity={0.9} 
                >
                    <Text style={[styles.menuItemText, inactiveTextStyle, isActive('index') && activeTextStyle]}>
                        Inicio
                    </Text>
                    <Entypo name="home" size={20} color={isActive('index') ? activeIconColor : inactiveIconColor} />
                </TouchableOpacity>
                
                {/* MIS CURSOS */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('auth/course') && activeItemStyle]} 
                    onPress={handleGoToCourses}
                    activeOpacity={0.9} 
                >
                    <Text style={[styles.menuItemText, inactiveTextStyle, isActive('auth/course') && activeTextStyle]}>
                        Mis Cursos
                    </Text>
                    <FontAwesome name="book" size={20} color={isActive('auth/course') ? activeIconColor : inactiveIconColor} />
                </TouchableOpacity>
                
                {/* 🚨 GENERADOR DE CV (PORTFOLIO) 🚨 */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('auth/portfolio') && activeItemStyle]} 
                    onPress={handleGoToCV} // Usamos la nueva función
                    activeOpacity={0.9} 
                >
                    <Text style={[styles.menuItemText, inactiveTextStyle, isActive('auth/portfolio') && activeTextStyle]}>
                        Generador de CV
                    </Text>
                    {/* Usamos un ícono representativo de documentos o CV */}
                    <FontAwesome name="id-card-o" size={20} color={isActive('auth/portfolio') ? activeIconColor : inactiveIconColor} />
                </TouchableOpacity>
                
                {/* MI ROL (testScreen) */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('auth/testScreen') && activeItemStyle]} 
                    onPress={handleGoToTest}
                    activeOpacity={0.9} 
                >
                    <Text style={[styles.menuItemText, inactiveTextStyle, isActive('auth/testScreen') && activeTextStyle]}>
                        Mi Rol
                    </Text>
                    <FontAwesome name="file-text-o" size={20} color={isActive('auth/testScreen') ? activeIconColor : inactiveIconColor} />
                </TouchableOpacity>
                
                {/* SEPARADOR */}
                <View style={[styles.menuSeparator, { backgroundColor: separatorColor, marginTop: 15 }]} />
                
                <Text style={[styles.sectionTitle, { color: theme.text + '99' }]}>
                    APARIENCIA
                </Text>

                {/* CONTENEDOR DEL MODO OSCURO */}
                <View style={styles.themeToggleContainer}> 
                    <Text style={[styles.menuItemText, inactiveTextStyle]}>
                        Modo Oscuro
                    </Text>
                    <Switch
                        trackColor={{ 
                            false: switchTrackColorFalse, 
                            true: switchTrackColorTrue
                        }}
                        thumbColor={switchThumbColor} 
                        ios_backgroundColor={switchTrackColorFalse}
                        onValueChange={toggleTheme}
                        value={isDark}
                    />
                </View>

                {/* SEPARADOR */}
                <View style={[styles.menuSeparator, { backgroundColor: separatorColor, marginBottom: 15 }]} />

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

// ... (Los estilos permanecen igual)

const styles = StyleSheet.create({
    container: { flex: 1, },
    menuItemsContainer: { flex: 1, paddingVertical: 4, },
    menuItem: { paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
    menuItemText: { fontSize: 15, fontWeight: '500', },
    menuSeparator: { height: 1, marginVertical: 4, marginHorizontal: 10, },
    
    sectionTitle: { 
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 20,
        marginTop: 20, 
        marginBottom: 5,
        textTransform: 'uppercase',
    },

    themeToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    }
});