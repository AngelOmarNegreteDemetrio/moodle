import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { getCVData, getPhoneNumber } from '../../services/auth/dataServices';
import { useTheme } from '../context/themeContext';

// Limpieza de HTML para asegurar texto puro y legible
const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().replace(/\s+/g, ' ');
};

const getCourseYear = (course) => {
    return course.startdate && course.startdate > 0 
        ? new Date(course.startdate * 1000).getFullYear() 
        : new Date().getFullYear();
};

export default function CVGeneratorScreen() {
    const [data, setData] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('No disponible'); 
    const [loading, setLoading] = useState(true);
    const { theme, isDark } = useTheme();
    
    const loadData = useCallback(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const userId = await AsyncStorage.getItem("moodleUserId");
                const cvData = await getCVData(); 
                setData(cvData);
                if (userId) {
                    const phone = await getPhoneNumber(parseInt(userId));
                    setPhoneNumber(phone);
                }
            } catch (error) {
                Alert.alert("Error", "No se pudo sincronizar el perfil académico.");
            } finally {
                setLoading(false);
            }
        }
        fetchData(); 
    }, []); 

    useFocusEffect(loadData); 

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const user = data?.userDetails || {};
    const courses = data?.userCourses || [];
    const badges = data?.userBadges || [];
    
    const PRIMARY_COLOR = isDark ? theme.primary : "#E83E4C"; 
    const MAIN_TEXT = theme.text || '#1C1C1C';
    const SUB_TEXT = theme.textSecondary || '#666';
    const CARD_BG = isDark ? '#1A1A1A' : '#F5F5F5';

    const userDescription = stripHtml(user.description);
    const completed = courses.filter(c => c.completed || c.progress >= 100);
    const inProgress = courses.filter(c => !c.completed && (c.progress < 100 || !c.progress));

    const renderCourse = (course, isCurrent) => (
        <View key={course.id} style={styles.courseCard}>
            <Text style={[styles.courseTitle, { color: MAIN_TEXT }]}>{course.fullname}</Text>
            <Text style={[styles.courseMeta, { color: SUB_TEXT }]}>
                {course.shortname} | {getCourseYear(course)}
            </Text>
            {/* Historial Académico con estilo formal y justificado */}
            <Text style={[styles.courseDesc, { color: SUB_TEXT }]}>
                {isCurrent 
                    ? "Actualmente cursando esta materia para fortalecer competencias técnicas y teóricas dentro del programa institucional." 
                    : "Certificación académica obtenida tras cumplir satisfactoriamente con los objetivos y requisitos del programa académico."}
            </Text>
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ padding: 25 }}>
            
            {/* CABECERA PROFESIONAL */}
            <View style={styles.header}>
                <Image source={{ uri: user.profileimageurl }} style={[styles.avatar, { borderColor: PRIMARY_COLOR }]} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: MAIN_TEXT }]}>{user.fullname}</Text>
                    <Text style={[styles.title, { color: PRIMARY_COLOR }]}>PERFIL ACADÉMICO PROFESIONAL</Text>
                    <Text style={[styles.contactText, { color: SUB_TEXT }]}>✉️ {user.email}</Text>
                    <Text style={[styles.contactText, { color: SUB_TEXT }]}>📞 {phoneNumber}</Text>
                </View>
            </View>

            {/* RESUMEN PROFESIONAL (SOBRE MÍ) */}
            {userDescription.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: MAIN_TEXT }]}>Resumen Profesional</Text>
                    <View style={[styles.line, { backgroundColor: PRIMARY_COLOR }]} />
                    <View style={[styles.descBox, { borderLeftColor: PRIMARY_COLOR }]}>
                        <Text style={[styles.descText, { color: MAIN_TEXT }]}>{userDescription}</Text>
                    </View>
                </View>
            )}

            {/* DASHBOARD DE ESTADÍSTICAS */}
            <View style={[styles.statsRow, { backgroundColor: CARD_BG }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: PRIMARY_COLOR }]}>{courses.length}</Text>
                    <Text style={[styles.statLabel, { color: SUB_TEXT }]}>Materias</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: PRIMARY_COLOR }]}>{badges.length}</Text>
                    <Text style={[styles.statLabel, { color: SUB_TEXT }]}>Insignias</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: PRIMARY_COLOR }]}>Estatus</Text>
                    <Text style={[styles.statLabel, { color: SUB_TEXT }]}>Activo {new Date().getFullYear()}</Text>
                </View>
            </View>

            {/* SECCIÓN DE RECONOCIMIENTOS */}
            {badges.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: MAIN_TEXT }]}>Reconocimientos</Text>
                    <View style={[styles.line, { backgroundColor: PRIMARY_COLOR }]} />
                    <View style={styles.badgeWrapper}>
                        {badges.map((badge, index) => (
                            <View key={index} style={[styles.badgeCard, { backgroundColor: PRIMARY_COLOR + '15' }]}>
                                <Text style={[styles.badgeText, { color: MAIN_TEXT }]}>🏆 {badge.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* HISTORIAL ACADÉMICO (JUSTIFICADO Y FORMAL) */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: MAIN_TEXT }]}>Historial Académico</Text>
                <View style={[styles.line, { backgroundColor: PRIMARY_COLOR }]} />
                {completed.length > 0 && completed.map(c => renderCourse(c, false))}
                {inProgress.length > 0 && inProgress.map(c => renderCourse(c, true))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    avatar: { width: 85, height: 85, borderRadius: 12, borderWidth: 2, marginRight: 15 },
    name: { fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 },
    title: { fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
    contactText: { fontSize: 12, marginBottom: 2, fontFamily: 'serif' },
    
    statsRow: { flexDirection: 'row', padding: 15, borderRadius: 8, marginBottom: 30, justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 18, fontWeight: 'bold' },
    statLabel: { fontSize: 9, textTransform: 'uppercase', marginTop: 2, fontWeight: '600' },

    section: { marginBottom: 35 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.2 },
    line: { height: 2, width: 40, marginTop: 4, marginBottom: 15 },
    
    // Perfil con fuente formal y justificado
    descBox: { paddingLeft: 15, borderLeftWidth: 3, paddingVertical: 5 },
    descText: { fontSize: 14, lineHeight: 22, fontStyle: 'italic', fontFamily: 'serif', textAlign: 'justify' },

    badgeWrapper: { flexDirection: 'row', flexWrap: 'wrap' },
    badgeCard: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4, marginRight: 8, marginBottom: 8, borderWidth: 0.5, borderColor: '#ccc' },
    badgeText: { fontSize: 12, fontWeight: '600' },

    // Historial Académico con fuente formal y justificado
    courseCard: { marginBottom: 22 },
    courseTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    courseMeta: { fontSize: 11, fontStyle: 'italic', marginBottom: 5 },
    courseDesc: { fontSize: 13, lineHeight: 19, fontFamily: 'serif', textAlign: 'justify' }
});