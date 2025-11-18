import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Platform,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from '../components/navigation/menu';

import { GetUserInfoService } from "../services/auth/userServices"; // Tu servicio de Moodle

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

const ProfileImagePlaceholder = { uri: 'https://via.placeholder.co/170/f0f0f0/888888?text=AB' };

/* --- FUNCIÓN PRINCIPAL DEL COMPONENTE --- */
export default function HomeScreen() {
    const router = useRouter();

    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [moodleToken, setMoodleToken] = useState(null);

    // FUNCIÓN DE CARGA DE DATOS DE MOODLE (SE MANTIENE)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem("moodleToken");
                if (!token) {
                    router.replace("/auth/Login");
                    return;
                }
                setMoodleToken(token);

                const username = await AsyncStorage.getItem("lastLoggedInUsername");

                if (!username) {
                    router.replace("/auth/Login");
                    return;
                }

                // Obtener los datos del usuario usando el servicio de Moodle
                const data = await GetUserInfoService(username, 'username');

                // Mapeo de datos 
                const mappedData = {
                    name: data.fullname || "Alumno Desconocido",
                    grade: data.userGrade,
                    email: data.email || "Sin correo",
                    school: "Nuevo Horizontes Global School",
                    profileImageUrl: data.profileimageurl || null,
                    type: data.userType,
                };

                setUserData(mappedData);

            } catch (error) {
                console.error("Error al cargar datos del perfil:", error);
                Alert.alert("Error de Sesión", `No se pudo cargar tu perfil. Razón: ${error.message}`);

                await AsyncStorage.removeItem("moodleToken");
                await AsyncStorage.removeItem("lastLoggedInUsername");

            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);


    if (isLoading || !userData) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: COLLEGE_COLORS.PRIMARY_RED }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLLEGE_COLORS.PRIMARY_RED} />
                    <Text style={{ marginTop: 10, color: COLLEGE_COLORS.TEXT_DARK }}>
                        Cargando datos del alumno...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }


    // LÓGICA PARA CARGAR LA IMAGEN CON HEADERS (SE MANTIENE)
    const profileImageSource = userData.profileImageUrl && moodleToken
        ? {
            uri: userData.profileImageUrl,
            headers: { Authorization: `Bearer ${moodleToken}` }
        }
        : ProfileImagePlaceholder;


    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: COLLEGE_COLORS.PRIMARY_RED }]}>

            <StatusBar
                barStyle="light-content"
                backgroundColor={COLLEGE_COLORS.PRIMARY_RED}
            />
            {/* I. BARRA DE ENCABEZADO / MENÚ DE NAVEGACIÓN */}
            <Header />

            {/* CONTENIDO PRINCIPAL DESPLAZABLE */}
            <ScrollView
                style={{ backgroundColor: COLLEGE_COLORS.LIGHT_GRAY }}
                contentContainerStyle={styles.scrollViewContent}
            >

                {/* SECCIÓN DE PERFIL PRINCIPAL */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCircle}>
                        {/* Imagen del perfil Usando el token */}
                        <Image
                            source={profileImageSource}
                            style={styles.profileImage}
                            resizeMode="contain"
                        />
                    </View>

                    {userData.type && userData.type !== "Tipo No Definido" && (
                        <Text style={styles.userType}>{userData.type}</Text>
                    )}

                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userGrade}>{userData.grade}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                </View>

                {/* IV. TARJETA DE INFORMACIÓN DESTACADA */}
                <View style={styles.highlightCard}>
                    <Text style={styles.cardTitle}>Mi Progreso General</Text>
                    <Text style={styles.cardSubtitle}>
                        Consulta tus cursos, calificaciones y logros usando el menú superior.
                    </Text>
                    <TouchableOpacity style={styles.cardButton} onPress={() => console.log("Botón presionado")}>
                        <Text style={styles.cardButtonText}>Abrir Menú de Navegación</Text>
                    </TouchableOpacity>
                </View>

                {/*INFORMACIÓN DE ESCUELA */}
                <View style={styles.footer}>
                    <Text style={styles.schoolFooterText}>
                        Escuela: {userData.school}
                    </Text>
                    <View style={styles.dotsContainer}>
                        <View style={[styles.dot, { backgroundColor: COLLEGE_COLORS.PRIMARY_RED }]} />
                        <View style={[styles.dot, { backgroundColor: '#FFA500' }]} />
                        <View style={[styles.dot, { backgroundColor: COLLEGE_COLORS.ACCENT_BLUE }]} />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    // Contenedor para la pantalla de carga
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLLEGE_COLORS.LIGHT_GRAY,
    },
    scrollViewContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
    },

    /* III. SECCIÓN DE PERFIL (Resto de estilos) */
    profileSection: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        width: '100%',
    },

    // 🔥 CÍRCULO PERFECTO con overflow hidden
    profileCircle: {
        width: 170,
        height: 170,
        borderRadius: 85,
        overflow: "hidden",
        backgroundColor: COLLEGE_COLORS.WHITE,
        borderWidth: 4,
        borderColor: COLLEGE_COLORS.WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    // 🔥 Imagen a máxima calidad y sin distorsión
    profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: 85,
    },

    userType: {
        fontSize: 16,
        fontWeight: '600',
        color: COLLEGE_COLORS.ACCENT_BLUE,
        marginBottom: 8,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 5,
        backgroundColor: COLLEGE_COLORS.ACCENT_BLUE + '10',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLLEGE_COLORS.TEXT_DARK,
        textAlign: 'center',
        marginTop: 5,
    },
    userGrade: {
        fontSize: 18,
        color: COLLEGE_COLORS.TEXT_DARK,
        marginTop: 2,
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: COLLEGE_COLORS.TEXT_LIGHT,
    },

    /* IV. TARJETA DE INFORMACIÓN DESTACADA */
    highlightCard: {
        width: '100%',
        borderRadius: 15,
        padding: 25,
        marginTop: 40,
        marginBottom: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
        backgroundColor: COLLEGE_COLORS.PRIMARY_RED,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLLEGE_COLORS.WHITE,
        marginBottom: 5,
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLLEGE_COLORS.WHITE,
        textAlign: 'center',
        opacity: 0.9,
        marginBottom: 15,
    },
    cardButton: {
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
        marginTop: 10,
        backgroundColor: COLLEGE_COLORS.WHITE,
    },
    cardButtonText: {
        color: COLLEGE_COLORS.PRIMARY_RED,
        fontWeight: 'bold',
        fontSize: 16,
    },

    /* V. PIE DE PÁGINA / INFORMACIÓN DE ESCUELA */
    footer: {
        alignItems: 'center',
        paddingBottom: 20,
        width: '100%',
        marginTop: 'auto',
    },
    schoolFooterText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLLEGE_COLORS.TEXT_DARK,
        marginTop: 15,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
});

