import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Asegúrate de que esta ruta sea correcta para tu servicio
import { getEnrolledCourses } from '../../services/auth/courseServices';

const PRIMARY_COLOR = '#E83E4C'; 
const BACKGROUND_COLOR = '#f5f5f5'; 

export default function CourseScreen() { 
    const router = useRouter();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // Mantenemos los estados de colapso si los quieres seguir usando
    const [isEnrolledExpanded, setIsEnrolledExpanded] = useState(true);
    const [isCompletedExpanded, setIsCompletedExpanded] = useState(true); 

    const fetchCourses = useCallback(async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true); 
        setError(null);
        try {
            // Se llama al servicio que SOLO trae la lista básica de cursos, 
            // SIN hacer llamadas adicionales para el progreso.
            const data = await getEnrolledCourses(); 
            setCourses(Array.isArray(data) ? data : []); 
        } catch (err) {
            console.error("Fallo al cargar los cursos:", err);
            Alert.alert("Error de Carga", err.message || "No se pudieron cargar los cursos.");
            setError(err.message || "No se pudieron cargar los cursos.");
            setCourses([]); 
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []); 

    // --- FUNCIÓN DE CLIC PARA NAVEGAR A DETALLE ---
    const handleCoursePress = (courseId, courseName) => {
        router.push({
            pathname: "/auth/courseDetail", 
            params: { 
                courseId: courseId.toString(), 
                courseName: courseName 
            } 
        });
    };
    // ---------------------------------------------

    useFocusEffect(
        useCallback(() => {
            fetchCourses(false);
        }, [fetchCourses])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses(true);
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                    <Text style={styles.loadingText}>Cargando cursos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>❌ Error al cargar los datos:</Text>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 🚨 CAMBIO CLAVE: Ya no podemos filtrar por progreso. 
    // Usaremos todos los cursos como "Inscritos" por simplicidad.
    const allCourses = courses; 
    
    // Si necesitas las secciones, necesitarás una forma alternativa de dividir los cursos (ej. por categoría o estado manual)
    // Para simplificar y mantener la estructura, colocamos todos en "Cursos Inscritos" (enrolledCourses)
    const enrolledCourses = allCourses;
    const completedCourses = []; // Dejamos esta lista vacía a menos que tengas otra forma de identificarlos.
    

    // --- RENDERIZADO DEL ÍTEM DE CURSO (SIMPLIFICADO) ---
    const renderCourseItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.courseItem}
            onPress={() => handleCoursePress(item.id, item.fullname)}
        >
            {/* Solo mostramos el nombre y el ID */}
            <View> 
                <Text style={styles.courseTitle}>{item.fullname}</Text>
                <Text style={styles.courseSubtitle}>ID Moodle: {item.id}</Text> 
            </View>
            {/* 🛑 Eliminamos el View style={styles.progressContainer} y el Text style={styles.progressText} */}
        </TouchableOpacity>
    );

    // --- VISTA PRINCIPAL (FINAL) ---
    return (
        <SafeAreaView style={styles.safeArea}>
            
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
                }
            >
                
                {/* CURSOS INSCRITOS */}
                <TouchableOpacity 
                    style={styles.sectionHeader} 
                    onPress={() => setIsEnrolledExpanded(!isEnrolledExpanded)}
                >
                    <Text style={styles.sectionTitle}>Cursos Inscritos ({enrolledCourses.length})</Text>
                    <Text style={styles.collapseIcon}>
                        {isEnrolledExpanded ? '—' : '+'}
                    </Text>
                </TouchableOpacity>

                
                {isEnrolledExpanded && enrolledCourses.length > 0 ? (
                    <FlatList
                        data={enrolledCourses}
                        renderItem={renderCourseItem}
                        keyExtractor={item => `enrolled-${item.id.toString()}`}
                        scrollEnabled={false} 
                        style={styles.flatList}
                    />
                ) : (
                    !loading && isEnrolledExpanded && <Text style={styles.noResultsText}>No hay cursos en progreso.</Text>
                )}
                
                
                {/* CURSOS TERMINADOS - ESTA SECCIÓN NO MOSTRARÁ NADA AHORA */}
                <TouchableOpacity 
                    style={[styles.sectionHeader, { marginTop: 20 }]}
                    onPress={() => setIsCompletedExpanded(!isCompletedExpanded)}
                >
                    <Text style={styles.sectionTitle}>Cursos Terminados ({completedCourses.length})</Text>
                    <Text style={styles.collapseIcon}>
                        {isCompletedExpanded ? '—' : '+'}
                    </Text>
                </TouchableOpacity>
                
                
                {isCompletedExpanded && completedCourses.length > 0 ? (
                    <FlatList
                        data={completedCourses}
                        renderItem={renderCourseItem}
                        keyExtractor={item => `completed-${item.id.toString()}`}
                        scrollEnabled={false}
                        style={styles.flatList}
                    />
                ) : (
                    !loading && isCompletedExpanded && <Text style={styles.noResultsText}>No hay resultados para mostrar.</Text>
                )}
                
                
                <View style={{ height: 30 }} />

            </ScrollView>
        </SafeAreaView>
    );
}

// --- ESTILOS (MODIFICADOS) ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR, 
    },
    scrollView: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR, 
    },
    flatList: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
        borderTopWidth: 0,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND_COLOR,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    sectionHeader: {
        backgroundColor: PRIMARY_COLOR, 
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    collapseIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    // Estilo del item ahora es un TouchableOpacity
    courseItem: { 
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        // 🚨 CAMBIO: Ajustamos el maxWidth para que el título use todo el espacio disponible
        maxWidth: '100%', 
    },
    courseSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    // 🛑 Eliminamos progressContainer y progressText.
    noResultsText: {
        padding: 15,
        marginHorizontal: 15,
        color: '#666',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderTopWidth: 0,
    }
});