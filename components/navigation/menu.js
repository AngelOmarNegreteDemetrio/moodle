import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import {
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
// 1. CUSTOM HEADER (Barra Superior)
// ===========================================

export function CustomHeader({ onMenuPress }) { 
    const { isDark } = useTheme(); 
    const navigation = useNavigation();
    
    const headerColor = isDark 
        ? COLLEGE_COLORS.COLOR_OSCURO_COINCIDENTE 
        : COLLEGE_COLORS.COLOR_CLARO_COINCIDENTE; 
    
    const iconColor = COLLEGE_COLORS.WHITE; 

    // ✅ Función de Notificaciones actualizada para navegar
    const handleGoToNotifications = () => {
        navigation.navigate('auth/notifications'); 
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
                    <View>
                        <FontAwesome name="bell" size={24} color={iconColor} />
                        {/* 🔔 Badge de notificación (punto amarillo) */}
                        <View style={headerStyles.badge} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ===========================================
// 2. DEFAULT EXPORT (MenuContent del Drawer)
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
        const focusedRoute = state.routes[state.index].name;
        return focusedRoute === routeName;
    };
    
    const handleGoToLogin = async () => {
        if (navigation) navigation.closeDrawer(); 
        await AsyncStorage.removeItem("moodleToken");
        await AsyncStorage.removeItem("lastLoggedInUsername");
        router.replace('/auth/Login'); 
    };

    // Funciones de navegación existentes
    const handleGoToindex = () => { if (navigation) navigation.navigate('index'); }
    const handleGoToCourses = () => { if (navigation) navigation.navigate('auth/course'); };
    const handleGoToTest = () => { if (navigation) navigation.navigate('auth/testScreen'); }
    const handleGoToCV = () => { if (navigation) navigation.navigate('auth/portfolio'); } 
    
    const inactiveIconColor = theme.text;
    const inactiveTextStyle = { color: theme.text };
    const separatorColor = isDark ? theme.border : '#E0E0E0'; 

    return (
        <DrawerContentScrollView 
            {...props} 
            contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        > 
            <View style={styles.menuItemsContainer}>

                {/* INICIO */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('index') && activeItemStyle]} 
                    onPress={handleGoToindex}
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
                >
                    <Text style={[styles.menuItemText, inactiveTextStyle, isActive('auth/course') && activeTextStyle]}>
                        Mis Cursos
                    </Text>
                    <FontAwesome name="book" size={20} color={isActive('auth/course') ? activeIconColor : inactiveIconColor} />
                </TouchableOpacity>
                
                {/* GENERADOR DE CV */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('auth/portfolio') && activeItemStyle]} 
                    onPress={handleGoToCV}
                >
                    <Text style={[styles.menuItemText, inactiveTextStyle, isActive('auth/portfolio') && activeTextStyle]}>
                        Generador de CV
                    </Text>
                    <FontAwesome name="id-card-o" size={20} color={isActive('auth/portfolio') ? activeIconColor : inactiveIconColor} />
                </TouchableOpacity>
                
                {/* MI ROL */}
                <TouchableOpacity 
                    style={[styles.menuItem, isActive('auth/testScreen') && activeItemStyle]} 
                    onPress={handleGoToTest}
                >
                    <Text style={[styles.menuItemText, inactiveTextStyle, isActive('auth/testScreen') && activeTextStyle]}>
                        Mi Rol
                    </Text>
                    <FontAwesome name="file-text-o" size={20} color={isActive('auth/testScreen') ? activeIconColor : inactiveIconColor} />
                </TouchableOpacity>
                
                <View style={[styles.menuSeparator, { backgroundColor: separatorColor, marginTop: 15 }]} />
                
                <Text style={[styles.sectionTitle, { color: theme.text + '99' }]}>APARIENCIA</Text>

                <View style={styles.themeToggleContainer}> 
                    <Text style={[styles.menuItemText, inactiveTextStyle]}>Modo Oscuro</Text>
                    <Switch
                        trackColor={{ false: '#F0F0F0', true: menuActiveColor }}
                        thumbColor={isDark ? COLLEGE_COLORS.WHITE : '#000000'}
                        onValueChange={toggleTheme}
                        value={isDark}
                    />
                </View>

                <View style={[styles.menuSeparator, { backgroundColor: separatorColor, marginBottom: 15 }]} />

                <TouchableOpacity style={styles.menuItem} onPress={handleGoToLogin}>
                    <Text style={[styles.menuItemText, { color: COLLEGE_COLORS.LOGOUT_RED }]}>Cerrar Sesión</Text>
                    <Entypo name="log-out" size={20} color={COLLEGE_COLORS.LOGOUT_RED} />
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
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
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: COLLEGE_COLORS.WHITE },
    menuButton: { padding: 5 },
    notificationButton: { padding: 5 },
    badge: {
        position: 'absolute',
        right: -2,
        top: -2,
        backgroundColor: '#FFEB3B', // Color amarillo para resaltar sobre el rojo
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#FF0000',
    }
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    menuItemsContainer: { flex: 1, paddingVertical: 4 },
    menuItem: { paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    menuItemText: { fontSize: 15, fontWeight: '500' },
    menuSeparator: { height: 1, marginVertical: 4, marginHorizontal: 10 },
    sectionTitle: { fontSize: 12, fontWeight: '600', paddingHorizontal: 20, marginTop: 20, marginBottom: 5, textTransform: 'uppercase' },
    themeToggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }
});