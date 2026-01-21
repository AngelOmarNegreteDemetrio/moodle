import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

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
            Alert.alert(t('common.error'), err.message || t('courses.no_courses'));
            setError(err.message || t('courses.no_courses'));
            setCourses([]); 
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]); 

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

    const primaryColorOptimized = isDark ? '#F55D69' : theme.primary; 
    const secondaryTextColor = isDark ? '#AAAAAA' : '#666666'; 
    const separatorColor = isDark ? theme.background : '#F0F0F0'; 

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
                        {t('common.loading')}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const enrolledCourses = courses;
    const completedCourses = []; 

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
                <Text style={[styles.courseTitle, { color: theme.text }]}>{item.fullname}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.background }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColorOptimized]} /> 
                }
            >
                <TouchableOpacity 
                    style={[
                        styles.sectionHeader, 
                        { 
                            backgroundColor: primaryColorOptimized, 
                            shadowOpacity: isDark ? 0.05 : 0.1, 
                            elevation: isDark ? 0 : 3
                        }
                    ]} 
                    onPress={() => setIsEnrolledExpanded(!isEnrolledExpanded)}
                >
                    <Text style={styles.sectionTitle}>
                        {t('courses.title')} ({enrolledCourses.length})
                    </Text>
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
                        style={[styles.flatList, { backgroundColor: theme.card }]}
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
                            {t('courses.no_courses')}
                        </Text>
                    )
                )}
                
                <TouchableOpacity 
                    style={[
                        styles.sectionHeader, 
                        { 
                            marginTop: 20, 
                            backgroundColor: primaryColorOptimized,
                            shadowOpacity: isDark ? 0.05 : 0.1, 
                            elevation: isDark ? 0 : 3
                        }
                    ]}
                    onPress={() => setIsCompletedExpanded(!isCompletedExpanded)}
                >
                    <Text style={styles.sectionTitle}>
                        {t('courses.completed')} ({completedCourses.length})
                    </Text>
                    <Text style={styles.collapseIcon}>
                        {isCompletedExpanded ? '—' : '+'}
                    </Text>
                </TouchableOpacity>
                
                {isCompletedExpanded && (
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
                        {t('courses.no_courses')}
                    </Text>
                )}
                
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

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
    noResultsText: {
        padding: 15,
        marginHorizontal: 15,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 10,
    }
    
});