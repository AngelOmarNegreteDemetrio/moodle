import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '../app/context/themeContext';
import Header from '../components/navigation/menu';
import { GetUserInfoService } from "../services/auth/userServices"; // Tu servicio de Moodle

const HEADER_HEIGHT = 70;
const SCREEN_WIDTH = Dimensions.get('window').width;

/* ⚠️ NOTA: COLLEGE_COLORS se mantiene como referencia, pero ya no se usa. */
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

const ProfileImagePlaceholder = { uri: 'https://via.placeholder.co/170/f0f0f0/888888?text=AB' };

/* --- FUNCIÓN PRINCIPAL DEL COMPONENTE --- */
export default function HomeScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme(); 

    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [moodleToken, setMoodleToken] = useState(null);

    // 🔔 NUEVA VARIABLE: Solo agregamos este estado para la campana
    const [hasNotifications, setHasNotifications] = useState(false);

    // --- VARIABLES DE TEMA OPTIMIZADAS ---
    const primaryColorOptimized = isDark ? '#F55D69' : theme.primary; 
    const secondaryTextColor = isDark ? '#AAAAAA' : '#666666'; 
    const cardContrastColor = isDark ? theme.background : COLLEGE_COLORS.WHITE;
    const profileBorderColor = isDark ? theme.border : COLLEGE_COLORS.WHITE;

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchUserData = async () => {
                setIsLoading(true);
                setUserData(null);
                
                try {
                    const token = await AsyncStorage.getItem("moodleToken");
                    if (!token) {
                        router.replace("/auth/Login");
                        return;
                    }
                    if (isActive) setMoodleToken(token);

                    const username = await AsyncStorage.getItem("lastLoggedInUsername");

                    if (!username) {
                        router.replace("/auth/Login");
                        return;
                    }

                    const data = await GetUserInfoService(username, 'username');

                    const mappedData = {
                        name: data.fullname || "Alumno Desconocido",
                        grade: data.userGrade,
                        email: data.email || "Sin correo",
                        school: "Nuevo Horizontes Global School",
                        profileImageUrl: data.profileimageurl || null,
                        type: data.userType,
                    };

                    if (isActive) {
                        setUserData(mappedData);
                        // 🔔 Lógica para activar la campana (ejemplo: si hay datos, hay avisos)
                        if (data) setHasNotifications(true);
                    }

                } catch (error) {
                    console.error("Error al cargar datos del perfil:", error);
                    Alert.alert("Error de Sesión", `No se pudo cargar tu perfil. Razón: ${error.message}. Serás redirigido al Login.`);

                    await AsyncStorage.removeItem("moodleToken");
                    await AsyncStorage.removeItem("lastLoggedInUsername");
                    if (isActive) router.replace("/auth/Login");

                } finally {
                    if (isActive) setIsLoading(false);
                }
            };

            fetchUserData();

            return () => {
                isActive = false;
            };
        }, [])
    );

    if (isLoading || !userData) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <View style={[styles.loadingContainer, {backgroundColor: theme.background}]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={{ marginTop: 10, color: theme.text }}>
                        Cargando datos del alumno...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }
    
    const profileImageSource = userData.profileImageUrl && moodleToken
        ? {
            uri: userData.profileImageUrl,
            headers: { Authorization: `Bearer ${moodleToken}` }
        }
        : ProfileImagePlaceholder;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: primaryColorOptimized }]}>

            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={primaryColorOptimized} 
            />
            {/* 🔔 AQUÍ AGREGAMOS LA PROP: hasNotifications={hasNotifications} */}
            <Header hasNotifications={hasNotifications} />

            <ScrollView
                style={{ backgroundColor: theme.background }}
                contentContainerStyle={styles.scrollViewContent}
            >

                {/* SECCIÓN DE PERFIL PRINCIPAL */}
                <View style={styles.profileSection}>
                    <View style={[
                        styles.profileCircle, 
                        { 
                            backgroundColor: theme.card, 
                            borderColor: profileBorderColor, 
                            shadowColor: isDark ? theme.background : '#000',
                        }
                    ]}>
                        <Image
                            key={profileImageSource.uri}
                            source={profileImageSource}
                            style={styles.profileImage}
                            resizeMode="contain"
                        />
                    </View>

                    {userData.type && userData.type !== "Tipo No Definido" && (
                        <Text style={[
                            styles.userType, 
                            { 
                                color: COLLEGE_COLORS.ACCENT_BLUE,
                                backgroundColor: isDark ? theme.background + '80' : COLLEGE_COLORS.ACCENT_BLUE + '10',
                                borderColor: COLLEGE_COLORS.ACCENT_BLUE, 
                                borderWidth: 1
                            }
                        ]}>{userData.type}</Text>
                    )}

                    <Text style={[styles.userName, { color: theme.text }]}>{userData.name}</Text>
                    <Text style={[styles.userGrade, { color: theme.text }]}>{userData.grade}</Text>
                    <Text style={[styles.userEmail, { color: secondaryTextColor }]}>{userData.email}</Text>
                </View>

                {/* IV. TARJETA DE INFORMACIÓN DESTACADA */}
                <View style={[
                    styles.highlightCard, 
                    { backgroundColor: primaryColorOptimized }
                ]}>
                    <Text style={styles.cardTitle}>Mi Progreso General</Text>
                    <Text style={styles.cardSubtitle}>
                        Consulta tus cursos, calificaciones y logros usando el menú superior.
                    </Text>
                    <TouchableOpacity style={[
                        styles.cardButton,
                        { backgroundColor: cardContrastColor }
                    ]} onPress={() => console.log("Botón presionado")}>
                        <Text style={[
                            styles.cardButtonText, 
                            { color: primaryColorOptimized }
                        ]}>Abrir Menú de Navegación</Text>
                    </TouchableOpacity>
                </View>

                {/* INFORMACIÓN DE ESCUELA */}
                <View style={styles.footer}>
                    <Text style={[styles.schoolFooterText, { color: theme.text }]}>
                        Escuela: {userData.school}
                    </Text>
                    <View style={styles.dotsContainer}>
                        <View style={[styles.dot, { backgroundColor: primaryColorOptimized }]} />
                        <View style={[styles.dot, { backgroundColor: '#FFA500' }]} /> 
                        <View style={[styles.dot, { backgroundColor: COLLEGE_COLORS.ACCENT_BLUE }]} />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollViewContent: { paddingHorizontal: 20, alignItems: 'center', flexGrow: 1, justifyContent: 'space-between' },
    profileSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 20, width: '100%' },
    profileCircle: { width: 170, height: 170, borderRadius: 85, overflow: "hidden", borderWidth: 4, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10, justifyContent: "center", alignItems: "center", marginBottom: 20 },
    profileImage: { width: "100%", height: "100%", borderRadius: 85 },
    userType: { fontSize: 16, fontWeight: '600', marginBottom: 8, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5 },
    userName: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 5 },
    userGrade: { fontSize: 18, marginTop: 2, marginBottom: 5 },
    userEmail: { fontSize: 14 },
    highlightCard: { width: '100%', borderRadius: 15, padding: 25, marginTop: 40, marginBottom: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 8 },
    cardTitle: { fontSize: 20, fontWeight: '700', color: COLLEGE_COLORS.WHITE, marginBottom: 5 },
    cardSubtitle: { fontSize: 14, color: COLLEGE_COLORS.WHITE, textAlign: 'center', opacity: 0.9, marginBottom: 15 },
    cardButton: { paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20, marginTop: 10 },
    cardButtonText: { fontWeight: 'bold', fontSize: 16 },
    footer: { alignItems: 'center', paddingBottom: 20, width: '100%', marginTop: 'auto' },
    schoolFooterText: { fontSize: 16, fontWeight: '600', marginTop: 15 },
    dotsContainer: { flexDirection: 'row', marginTop: 10 },
    dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
});