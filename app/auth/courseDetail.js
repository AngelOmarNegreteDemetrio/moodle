import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList,
    Linking,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GetCourseActivitiesService } from "../../services/auth/courseServices";
import { useTheme } from '../context/themeContext';

/* Colores unificados para la coherencia del encabezado */
const COLLEGE_COLORS_COINCIDENTE = {
    CLARO: '#FF0000', 
    OSCURO: '#F55D69', 
    SECONDARY: '#49B6CC',
};

/* Componente principal */
export default function CourseDetailScreen() {
    const router = useRouter();
    const { courseId, courseName } = useLocalSearchParams(); 

    const { theme, isDark } = useTheme();

    /* Definición dinámica de colores */
    const HEADER_COLOR = isDark 
        ? COLLEGE_COLORS_COINCIDENTE.OSCURO 
        : COLLEGE_COLORS_COINCIDENTE.CLARO; 
        
    const ACTIVITY_ACCENT_COLOR = isDark ? theme.primary : COLLEGE_COLORS_COINCIDENTE.SECONDARY; 
    const PRIMARY_COLOR = HEADER_COLOR; 
    
    const ACCENT_TEXT_COLOR = isDark ? theme.text : '#333'; 
    const CARD_BACKGROUND_COLOR = theme.card; 
    const BACKGROUND_COLOR = theme.background; 
    const LIGHT_TEXT_COLOR = isDark ? theme.text : '#FFFFFF';

    const [pendingActivities, setPendingActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivities = useCallback(async () => {
        setIsLoading(true);
        const id = parseInt(courseId); 
        
        if (isNaN(id)) {
            Alert.alert("Error de ID", "ID de curso no válido.");
            setIsLoading(false);
            return;
        }

        try {
            const activities = await GetCourseActivitiesService(id);
            setPendingActivities(activities);
        } catch (error) {
            console.error("Error al cargar actividades:", error);
            Alert.alert("Error de Carga", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useFocusEffect(
        useCallback(() => {
            fetchActivities();
        }, [fetchActivities])
    );
    
    const handleOpenActivity = (url) => {
        if (url) {
            Linking.openURL(url).catch(err => {
                console.error("Failed to open URL:", err);
                Alert.alert("Error", "No se pudo abrir el enlace de la actividad.");
            });
        } else {
            Alert.alert("Error", "URL de actividad no disponible.");
        }
    };

    const renderActivity = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.activityItem,
                { backgroundColor: CARD_BACKGROUND_COLOR, borderLeftColor: ACTIVITY_ACCENT_COLOR }
            ]} 
            onPress={() => handleOpenActivity(item.url)}
        >
            <View style={styles.activityInfo}>
                <Text style={[styles.activitySectionType, { color: PRIMARY_COLOR }]}>{item.type.toUpperCase()}</Text> 
                <Text style={[styles.activityName, { color: ACCENT_TEXT_COLOR }]} numberOfLines={2}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.loadingContainer, { backgroundColor: BACKGROUND_COLOR }]}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                {/* 🚨 CAMBIO DE TEXTO IMPLEMENTADO: */}
                <Text style={[styles.loadingText, { color: ACCENT_TEXT_COLOR }]}>Cargando...</Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: BACKGROUND_COLOR }]}>
            {/* ENCABEZADO PERSONALIZADO */}
            <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
                <TouchableOpacity 
                    onPress={() => router.replace('/auth/course')} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={LIGHT_TEXT_COLOR} />
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={[styles.headerTitle, { color: LIGHT_TEXT_COLOR }]}>{courseName}</Text> 
                    <Text style={[styles.headerSubtitle, { color: LIGHT_TEXT_COLOR }]}>Actividades Pendientes: {pendingActivities.length}</Text>
                </View>
            </View>
            {/* FIN DEL ENCABEZADO */}

            {pendingActivities.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: ACCENT_TEXT_COLOR }]}>¡Felicidades! 🎉</Text>
                    <Text style={[styles.emptyText, { color: ACCENT_TEXT_COLOR }]}>No tienes actividades pendientes en este curso.</Text>
                    <TouchableOpacity style={[styles.secondaryBackButton, { backgroundColor: PRIMARY_COLOR }]} onPress={() => router.replace('/auth/course')}>
                         <Text style={styles.secondaryBackButtonText}>Volver a Cursos</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={pendingActivities}
                    renderItem={renderActivity}
                    keyExtractor={item => item.id.toString()}
                    style={styles.list}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

/* CONFIGURACIÓN CLAVE DE EXPO ROUTER: Ocultar el encabezado por defecto */
CourseDetailScreen.options = {
    headerShown: false,
};


const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10 },
    header: { 
        paddingHorizontal: 20, 
        paddingVertical: 15,
        flexDirection: 'row', 
        alignItems: 'center',
        // 🚨 AJUSTE PARA EVITAR QUE SE PEGUE ARRIBA:
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    headerTextContainer: {
        flexShrink: 1,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 14, opacity: 0.8 },
    list: { flex: 1, paddingHorizontal: 10, marginTop: 10 },
    
    activityItem: { 
        padding: 15, 
        marginVertical: 8, 
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 5,
    },
    activityInfo: { flexShrink: 1, marginRight: 10 },
    activityName: { fontSize: 16, fontWeight: '600' },
    
    activitySectionType: { 
        fontSize: 12, 
        marginBottom: 4, 
        fontWeight: 'bold'
    },
    
    activitySection: { fontSize: 12, marginBottom: 4, fontWeight: '500' },
    activityType: { fontSize: 14, fontWeight: 'bold' }, 

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { fontSize: 18, textAlign: 'center', marginTop: 10 },
    secondaryBackButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    secondaryBackButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});