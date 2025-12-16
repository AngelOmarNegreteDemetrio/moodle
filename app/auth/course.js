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

import { useTheme } from '../../app/context/themeContext';
import { getEnrolledCourses } from '../../services/auth/courseServices';

export default function CourseScreen() { 
    const router = useRouter();
    const { theme, isDark } = useTheme();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    const [isEnrolledExpanded, setIsEnrolledExpanded] = useState(true);
    const [isCompletedExpanded, setIsCompletedExpanded] = useState(true); 

    const fetchCourses = useCallback(async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true); 
        setError(null);
        try {
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

    const handleCoursePress = (courseId, courseName) => {
        router.push({
            pathname: "/auth/courseDetail", 
            params: { 
                courseId: courseId.toString(), 
                courseName: courseName 
            } 
        });
    };

    useFocusEffect(
        useCallback(() => {
            fetchCourses(false);
        }, [fetchCourses])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses(true);
    };

    // --- VARIABLES DE TEMA OPTIMIZADAS ---
    // 🚨 1. Color primario para el modo oscuro (menos saturado)
    const primaryColorOptimized = isDark ? '#F55D69' : theme.primary; 

    // 2. Color secundario (gris)
    const secondaryTextColor = isDark ? '#AAAAAA' : '#666666'; 
    
    // 3. Color de separador (ultra-sutil)
    const separatorColor = isDark ? theme.background : '#F0F0F0'; 

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: secondaryTextColor }]}>Cargando cursos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                    <Text style={styles.errorText}>❌ Error al cargar los datos:</Text>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const enrolledCourses = courses;
    const completedCourses = []; 
    

    // --- RENDERIZADO DEL ÍTEM DE CURSO ---
    const renderCourseItem = ({ item, index }) => {
        const isLastItem = index === enrolledCourses.length - 1; 

        return (
            <TouchableOpacity 
                style={[
                    styles.courseItem, 
                    { 
                        backgroundColor: theme.card,
                        borderBottomColor: separatorColor,
                        borderBottomWidth: isLastItem ? 0 : 1 
                    }
                ]}
                onPress={() => handleCoursePress(item.id, item.fullname)}
            >
                <View> 
                    <Text style={[styles.courseTitle, { color: theme.text }]}>{item.fullname}</Text>
                    <Text style={[styles.courseSubtitle, { color: secondaryTextColor }]}>ID Moodle: {item.id}</Text> 
                </View>
            </TouchableOpacity>
        );
    };

    // --- VISTA PRINCIPAL (FINAL) ---
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            
            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.background }]}
                refreshControl={
                    // 🚨 Usamos el color optimizado para el control de recarga si es necesario
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColorOptimized]} /> 
                }
            >
                
                {/* CURSOS INSCRITOS */}
                <TouchableOpacity 
                    style={[
                        styles.sectionHeader, 
                        { 
                            // 🚨 USAMOS EL COLOR PRIMARIO OPTIMIZADO
                            backgroundColor: primaryColorOptimized, 
                            shadowOpacity: isDark ? 0.05 : 0.1, 
                            elevation: isDark ? 0 : 3
                        }
                    ]} 
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
                        style={[
                            styles.flatList, 
                            { 
                                backgroundColor: theme.card, 
                                borderWidth: 0, 
                                borderTopWidth: 0, 
                            }
                        ]}
                    />
                ) : (
                    !loading && isEnrolledExpanded && (
                        <Text style={[
                            styles.noResultsText, 
                            { 
                                color: secondaryTextColor, 
                                backgroundColor: theme.card, 
                                borderColor: theme.border,
                                borderWidth: 1, 
                                borderTopWidth: 0,
                            }
                        ]}>
                            No hay cursos en progreso.
                        </Text>
                    )
                )}
                
                
                {/* CURSOS TERMINADOS */}
                <TouchableOpacity 
                    style={[
                        styles.sectionHeader, 
                        { 
                            marginTop: 20, 
                            // 🚨 USAMOS EL COLOR PRIMARIO OPTIMIZADO
                            backgroundColor: primaryColorOptimized,
                            shadowOpacity: isDark ? 0.05 : 0.1, 
                            elevation: isDark ? 0 : 3
                        }
                    ]}
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
                        style={[
                            styles.flatList, 
                            { 
                                backgroundColor: theme.card, 
                                borderWidth: 0, 
                                borderTopWidth: 0,
                            }
                        ]}
                    />
                ) : (
                    !loading && isCompletedExpanded && (
                        <Text style={[
                            styles.noResultsText, 
                            { 
                                color: secondaryTextColor, 
                                backgroundColor: theme.card, 
                                borderColor: theme.border,
                                borderWidth: 1,
                                borderTopWidth: 0,
                            }
                        ]}>
                            No hay resultados para mostrar.
                        </Text>
                    )
                )}
                
                
                <View style={{ height: 30 }} />

            </ScrollView>
        </SafeAreaView>
    );
}

// --- ESTILOS FIJOS (Sin cambios en esta sección) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, },
    scrollView: { flex: 1, },
    flatList: {
        marginHorizontal: 15,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
        color: 'red', 
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    sectionHeader: {
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '600',
        maxWidth: '100%', 
    },
    courseSubtitle: {
        fontSize: 13,
        marginTop: 4,
    },
    noResultsText: {
        padding: 15,
        marginHorizontal: 15,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 10,
    }
});