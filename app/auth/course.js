import { useEffect, useState, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ActivityIndicator, FlatList, 
    ScrollView, RefreshControl, TouchableOpacity, SafeAreaView 
} from 'react-native';
// Se importa useFocusEffect de expo-router para forzar la recarga al enfocar la pantalla
import { useFocusEffect } from 'expo-router'; 

import { getEnrolledCourses } from '../../services/auth/courseServices'; 

const PRIMARY_COLOR = '#E83E4C'; 
const BACKGROUND_COLOR = '#f5f5f5'; 

export default function CourseScreen() { 
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // ESTADOS para manejar el colapso 
    const [isEnrolledExpanded, setIsEnrolledExpanded] = useState(true);
    const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

    const fetchCourses = useCallback(async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true); 
        setError(null);
        try {
            // Esta función lee el token y userId de AsyncStorage.
            // Al ser llamada cada vez que se enfoca la pantalla,
            // garantiza que se lean los datos del usuario actualmente logueado.
            const data = await getEnrolledCourses(); 
            setCourses(Array.isArray(data) ? data : []); 
        } catch (err) {
            console.error("Fallo al cargar los cursos:", err);
            setError(err.message || "No se pudieron cargar los cursos.");
            setCourses([]); 
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []); 

    // CAMBIO CRUCIAL: Usar useFocusEffect en lugar de useEffect
    useFocusEffect(
        useCallback(() => {
            fetchCourses(false);
            // La función de limpieza es opcional aquí, pero la dependencia es crucial.
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

    // Filtros que funcionan con progress null, undefined, o 0
    const enrolledCourses = courses.filter(course => (course.progress ?? 0) < 100); 
    const completedCourses = courses.filter(course => course.progress === 100); 

    const renderCourseItem = ({ item }) => (
        <View style={styles.courseItem}>
            <View>
                <Text style={styles.courseTitle}>{item.fullname}</Text>
                <Text style={styles.courseSubtitle}>ID Moodle: {item.id}</Text> 
            </View>
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    { (item.progress ?? 0).toFixed(2) + '%' }
                </Text>
            </View>
        </View>
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

// --- ESTILOS MODIFICADOS CON COLORES DE MARCA ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR, // Cambiamos el fondo del SafeArea a gris claro
    },
    scrollView: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR, // Fondo de la pantalla
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
        maxWidth: '70%',
    },
    courseSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    progressContainer: {
        alignItems: 'flex-end',
    },
    progressText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: PRIMARY_COLOR,
    },
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