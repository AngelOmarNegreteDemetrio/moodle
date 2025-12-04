import { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList,
    Linking,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Importamos Ionicons para el icono de flecha
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
// Asegúrate de que esta ruta sea correcta para tu estructura de proyecto
import { GetCourseActivitiesService } from "../../services/auth/courseServices";

const PRIMARY_COLOR = '#E83E4C'; 
const SECONDARY_COLOR = '#49B6CC'; 
const BACKGROUND_COLOR = '#f5f5f5';

// ----------------------------------------------------
// Componente principal
// ----------------------------------------------------
export default function CourseDetailScreen() {
    const router = useRouter();
    const { courseId, courseName } = useLocalSearchParams(); 

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

    // Función para renderizar cada actividad pendiente
    const renderActivity = ({ item }) => (
        <TouchableOpacity 
            style={styles.activityItem} 
            onPress={() => handleOpenActivity(item.url)}
        >
            <View style={styles.activityInfo}>
                {/* Muestra el tipo de actividad (SCORM/PAGE/RESOURCE) */}
                <Text style={styles.activitySectionType}>{item.type.toUpperCase()}</Text> 
                <Text style={styles.activityName} numberOfLines={2}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={styles.loadingText}>Cargando actividades de **{courseName || 'el curso'}**...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* --- ENCABEZADO PERSONALIZADO --- */}
            <View style={styles.header}>
                <TouchableOpacity 
                    // 🚨 CAMBIO CLAVE: Usamos router.replace para ir directamente a la ruta de cursos.
                    // Esto asume que tu archivo course.js está en la ruta /auth/course
                    onPress={() => router.replace('/auth/course')} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>{courseName}</Text> 
                    <Text style={styles.headerSubtitle}>Actividades Pendientes: {pendingActivities.length}</Text>
                </View>
            </View>
            {/* ---------------------------------------------------- */}

            {pendingActivities.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>¡Felicidades! 🎉</Text>
                    <Text style={styles.emptyText}>No tienes actividades pendientes en este curso.</Text>
                    <TouchableOpacity style={styles.secondaryBackButton} onPress={() => router.replace('/auth/course')}>
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
        </SafeAreaView>
    );
}

// ----------------------------------------------------
// CONFIGURACIÓN CLAVE DE EXPO ROUTER: Ocultar el encabezado por defecto
// ----------------------------------------------------
CourseDetailScreen.options = {
  headerShown: false,
};
// ----------------------------------------------------


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND_COLOR },
    loadingText: { marginTop: 10, color: '#333' },
    header: { 
        paddingHorizontal: 20, 
        paddingVertical: 15,
        backgroundColor: PRIMARY_COLOR, 
        flexDirection: 'row', 
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    headerTextContainer: {
        flexShrink: 1,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.8 },
    list: { flex: 1, paddingHorizontal: 10, marginTop: 10 },
    activityItem: { 
        backgroundColor: '#FFFFFF', 
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
        borderLeftColor: SECONDARY_COLOR,
    },
    activityInfo: { flexShrink: 1, marginRight: 10 },
    activityName: { fontSize: 16, fontWeight: '600', color: '#333' },
    
    activitySectionType: { 
        fontSize: 12, 
        color: PRIMARY_COLOR, 
        marginBottom: 4, 
        fontWeight: 'bold'
    },
    
    // Estos estilos se mantienen pero ya no se usan en renderActivity:
    activitySection: { fontSize: 12, color: '#666', marginBottom: 4, fontWeight: '500' },
    activityType: { fontSize: 14, color: PRIMARY_COLOR, fontWeight: 'bold' }, 

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { fontSize: 18, textAlign: 'center', color: '#333', marginTop: 10 },
    secondaryBackButton: {
        marginTop: 20,
        backgroundColor: PRIMARY_COLOR,
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