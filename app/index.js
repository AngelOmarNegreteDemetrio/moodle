import React, { useState } from 'react';
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
    Dimensions
} from 'react-native';
// Se han eliminado las importaciones de 'expo-router' y '@expo/vector-icons'
// para evitar errores de compilación en el entorno.

/* --- DEFINICIONES Y CONSTANTES --- */

const HEADER_HEIGHT = 70; // Altura ajustada del Header para posicionamiento
const SCREEN_WIDTH = Dimensions.get('window').width; // Obtenemos el ancho de la pantalla

const COLLEGE_COLORS = {
    PRIMARY_RED: '#E83E4C', /* Rojo principal (Dominante de la marca) */
    ACCENT_BLUE: '#49B6CC', /* Azul Turquesa/Cian (Secundario) */
    TEXT_DARK: '#333333', 
    TEXT_LIGHT: '#999999', 
    WHITE: '#FFFFFF',
    LIGHT_GRAY: '#F5F5F5', /* Fondo muy claro y limpio */
    PROFILE_CIRCLE: '#DDDDDD',
    BORDER_LIGHT: '#E0E0E0',
};

// Placeholder: Reemplaza con la URL de tu logo
const ProfileImagePlaceholder = { uri: 'https://via.placeholder.com/150/f0f0f0/888888?text=AB' }; 

/* --- FUNCIÓN PRINCIPAL DEL COMPONENTE --- */

export default function HomeScreen() {
    // La llamada al hook se comenta por si causaba el error de resolución.
    // useAuthRedirect(); 
    
    // --- Lógica del Menú Desplegable ---
    // Se ha eliminado el hook 'useRouter' debido a errores de compilación.
    const [isMenuVisible, setIsMenuVisible] = useState(false); 

    // Función que abre y cierra el menú
    const handleToggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };
const router = useRouter(); 
    // Función para manejar la navegación a Login (ahora solo registra la acción)
    const handleGoToLogin = () => {
        setIsMenuVisible(false); // 1. Cierra el menú
           router.push('/auth/Login'); // Navega a la ruta de Login
       
    };

    /* ⚠️ DATOS DE EJEMPLO */
    const userData = {
        name: "AARON BRAYDON VELAZQUEZ AVILA",
        grade: "7° Grado Secundaria",
        email: "aaronvelazquez@horizontes.edu.mx",
        school: "Nuevo Horizontes Global School",
    };
    /* ⚠️ FIN DATOS DE EJEMPLO */

    return (
        // CLAVE: Aplicamos el fondo rojo aquí para cubrir la barra de estado y el notch.
        <SafeAreaView style={[styles.safeArea, { backgroundColor: COLLEGE_COLORS.PRIMARY_RED }]}> 
            
            {/* Configuración de la barra de estado */}
            <StatusBar 
                barStyle="light-content"
                backgroundColor={COLLEGE_COLORS.PRIMARY_RED}
            />
            
            {/* I. HEADER - No necesita fondo inline porque SafeAreaView lo proporciona */}
            <View style={styles.header}>
                {/* Botón de Hamburguesa: Llama a handleToggleMenu */}
                <TouchableOpacity style={styles.menuButton} onPress={handleToggleMenu}>
                    {/* Reemplazado Feather icon por Text/Emoji */}
                    <Text style={styles.headerIconText}>☰</Text>
                </TouchableOpacity>
                
                {/* Logo Central (Usando Text como placeholder de logo) */}
                <Text style={styles.headerTitle}>college</Text>
                
                {/* Botón de Notificaciones */}
                <TouchableOpacity style={styles.notificationButton}>
                    {/* Reemplazado Feather icon por Text/Emoji */}
                    <Text style={styles.headerIconText}>🔔</Text>
                </TouchableOpacity>
            </View>

            {/* II. MENÚ DESPLEGABLE (Flotante) */}
            {isMenuVisible && (
                // Overlay que cierra el menú al tocar cualquier parte de la pantalla
                <TouchableOpacity 
                    style={styles.menuOverlay} 
                    onPress={() => setIsMenuVisible(false)}
                    activeOpacity={1}
                >
                    {/* Contenedor del menú, posicionado absolutamente */}
                    <View style={styles.dropdownMenu}>
                        
                        {/* Opción 1: Iniciar Sesión (o Perfil si ya está logueado) */}
                        <TouchableOpacity style={styles.menuItem} onPress={handleGoToLogin}>
                            <Text style={styles.menuItemText}>
                                {userData.name ? 'Ir al Perfil' : 'Iniciar Sesión'}
                            </Text>
                            {/* Icono de Perfil/Login */}
                            <Text style={styles.menuIconText}>
                                {userData.name ? '👤' : '🚪'}
                            </Text>
                        </TouchableOpacity>

                        {/* Opción 2: Cursos (o alguna otra opción principal) */}
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            setIsMenuVisible(false);
                            console.log("Navegar a Mis Cursos");
                        }}>
                            <Text style={styles.menuItemText}>Mis Cursos</Text>
                            {/* Icono de Libro */}
                            <Text style={styles.menuIconText}>📖</Text>
                        </TouchableOpacity>
                        
                    </View>
                </TouchableOpacity>
            )}

            {/* CLAVE: El ScrollView es ahora el que tiene el fondo gris y contiene el resto del contenido. */}
            <ScrollView 
                style={{ backgroundColor: COLLEGE_COLORS.LIGHT_GRAY }}
                contentContainerStyle={styles.scrollViewContent}
            > 
                
                {/* III. SECCIÓN DE PERFIL PRINCIPAL */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCircle}>
                        <Image source={ProfileImagePlaceholder} style={styles.profileImage} resizeMode="cover" />
                    </View>
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
                    {/* Botón BLANCO */}
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

/* --- ESTILOS --- */
const styles = StyleSheet.create({
    safeArea: {
        flex: 1, 
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
        
        // Mantenemos esta corrección para Android
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
        zIndex: 100, 
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLLEGE_COLORS.WHITE,
    },
    headerIconText: {
        fontSize: 24,
        color: COLLEGE_COLORS.WHITE,
        lineHeight: 28, // Asegura que el texto/emoji se centre bien
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
        // Calculamos la posición superior basada en la altura del header
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
    profileCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: COLLEGE_COLORS.PROFILE_CIRCLE,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        backgroundColor: COLLEGE_COLORS.WHITE,
    },
    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
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