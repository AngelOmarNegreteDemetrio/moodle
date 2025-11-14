import React, { useState, useEffect } from 'react'; // Importar useEffect
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
    ActivityIndicator, // Nuevo
    Alert, // Nuevo
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage"; // Nuevo

import { GetUserInfoService } from "../services/auth/userServices"; // Nuevo: Tu servicio de Moodle

/* --- DEFINICIONES Y CONSTANTES --- */
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

// 💡 Placeholder ajustado al tamaño de 170
const ProfileImagePlaceholder = { uri: 'https://via.placeholder.com/170/f0f0f0/888888?text=AB' }; 

/* --- FUNCIÓN PRINCIPAL DEL COMPONENTE --- */

export default function HomeScreen() {
    const router = useRouter(); 
    const [isMenuVisible, setIsMenuVisible] = useState(false); 

    // 🌟 ESTADOS NUEVOS PARA DATOS Y CARGA 🌟
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [moodleToken, setMoodleToken] = useState(null); 
    // 🌟 FIN ESTADOS NUEVOS 🌟
    
    // ----------------------------------------------------
    // FUNCIÓN DE CARGA DE DATOS DE MOODLE
    // ----------------------------------------------------
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

                // 2. Obtener los datos del usuario usando el servicio de Moodle
                // El servicio ahora devuelve la URL de imagen de la mejor calidad, Grado, Nivel y TIPO DE USUARIO.
                const data = await GetUserInfoService(username, 'username'); 
                
                // Mapeamos los datos de Moodle a tu estructura
                const mappedData = {
                    name: data.fullname || "Alumno Desconocido", 
                    grade: data.userGrade, 
                    email: data.email || "Sin correo",
                    school: "Nuevo Horizontes Global School", 
                    profileImageUrl: data.profileimageurl || null, // Usamos la URL que el servicio ya filtró
                    type: data.userType, // 💡 AGREGADO: El tipo de usuario extraído del servicio
                };

                setUserData(mappedData);

            } catch (error) {
                console.error("Error al cargar datos del perfil:", error);
                Alert.alert("Error de Sesión", `No se pudo cargar tu perfil. Razón: ${error.message}`);
                
                await AsyncStorage.removeItem("moodleToken");
                await AsyncStorage.removeItem("lastLoggedInUsername");
                // router.replace("/auth/Login"); 
                
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // ----------------------------------------------------
    // MANEJO DE LA INTERFAZ
    // ----------------------------------------------------

    const handleToggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    const handleGoToLogin = async () => {
        setIsMenuVisible(false); // Cierra el menú
        
        // 🚨 FUNCIÓN DE LOGOUT: Limpia el token al navegar
        await AsyncStorage.removeItem("moodleToken");
        await AsyncStorage.removeItem("lastLoggedInUsername");
        
        router.push('/auth/Login'); // Navega a la ruta de Login
    };

    // Ajustado: Manejador para el botón de Notificaciones 
    const handleGoToNotifications = () => {
        console.log("Navegar a Notificaciones");
        // Aquí podrías agregar lógica de navegación si tuvieras una ruta '/notifications'
    };

    // ----------------------------------------------------
    // PANTALLA DE CARGA
    // ----------------------------------------------------

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
    
    // ----------------------------------------------------
    // RENDERIZADO DEL CONTENIDO CON DATOS REALES
    // ----------------------------------------------------

    // 💡 LÓGICA PARA CARGAR LA IMAGEN CON HEADERS
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
            
            {/* I. HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton} onPress={handleToggleMenu}>
                    <Text style={styles.headerIconText}><Entypo name="menu" size={34} color="white" /></Text>
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>college</Text>
                
                {/* 💡 CAMBIADO: A una silueta de campana minimalista usando el carácter Unicode 🔔 */}
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
                        
                        {/* Opción 1: Logout (usamos el handleGoToLogin como Logout) */}
                        <TouchableOpacity style={styles.menuItem} onPress={handleGoToLogin}>
                            <Text style={styles.menuItemText}>
                                Cerrar Sesión
                            </Text>
                            <Text style={styles.menuIconText}>
                                🚪
                            </Text>
                        </TouchableOpacity>

                        {/* Opción 2: Cursos */}
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            setIsMenuVisible(false);
                            console.log("Navegar a Mis Cursos");
                        }}>
                            <Text style={styles.menuItemText}>Mis Cursos</Text>
                            <Text style={styles.menuIconText}>📖</Text>
                        </TouchableOpacity>
                        
                    </View>
                </TouchableOpacity>
            )}

            {/* III. CONTENIDO PRINCIPAL SCROLLABLE */}
            <ScrollView 
                style={{ backgroundColor: COLLEGE_COLORS.LIGHT_GRAY }}
                contentContainerStyle={styles.scrollViewContent}
            > 
                
                {/* III. SECCIÓN DE PERFIL PRINCIPAL */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCircle}>
                        {/* 🚨 IMAGEN DE PERFIL: Usa la fuente dinámica que incluye el token */}
                        <Image 
                            source={profileImageSource} // 💡 USAMOS LA FUENTE DEFINIDA ARRIBA
                            style={styles.profileImage} 
                            resizeMode="cover" 
                        />
                    </View>
                    
                    {/* NUEVO: Tipo de Usuario (Profesor/Estudiante) */}
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
                    <TouchableOpacity style={styles.cardButton} onPress={handleToggleMenu}>
                        <Text style={styles.cardButtonText}>Abrir Menú de Navegación</Text>
                    </TouchableOpacity>
                </View>

                {/* V. PIE DE PÁGINA / INFORMACIÓN DE ESCUELA */}
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

// ----------------------------------------------------
// ESTILOS (Actualizados para la imagen de perfil)
// ----------------------------------------------------

const styles = StyleSheet.create({
    safeArea: {
        flex: 1, 
    },
    // 🌟 NUEVO ESTILO: Contenedor para la pantalla de carga
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
        zIndex: 100, 
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLLEGE_COLORS.WHITE,
    },
    // 💡 Ajuste de tamaño para el nuevo icono de campana (se ve mejor en 20px)
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

    /* II. MENÚ DESPLEGABLE (NUEVOS ESTILOS) */
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        zIndex: 99, 
    },
    dropdownMenu: {
        position: 'absolute',
        top: (Platform.OS === 'android' && StatusBar.currentHeight ? StatusBar.currentHeight : 0) + HEADER_HEIGHT, 
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
    
    /* III. SECCIÓN DE PERFIL (Resto de estilos) */
    profileSection: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        width: '100%',
    },
    // 💡 MODIFICADO: Volvemos a CÍRCULO (borderRadius: 85) y agregamos borde blanco para que resalte.
    profileCircle: { 
        width: 170, 
        height: 170,
        borderRadius: 85, // <<< CORRECCIÓN: Vuelve a CÍRCULO
        borderWidth: 4, // Nuevo: Borde para que resalte
        borderColor: COLLEGE_COLORS.WHITE, // Color blanco
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        // Mejoramos la sombra para que flote suavemente
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2, 
        shadowRadius: 10, 
        elevation: 10,
        backgroundColor: COLLEGE_COLORS.WHITE,
    },
    // 💡 MODIFICADO: Volvemos a CÍRCULO (borderRadius: 85)
    profileImage: {
        width: 162, // 170 - (4*2) = 162 (ajustamos por el grosor del borde)
        height: 162, 
        borderRadius: 81, // <<< CORRECCIÓN: Vuelve a CÍRCULO (mitad de 162)
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