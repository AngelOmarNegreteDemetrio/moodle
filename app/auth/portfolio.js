import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCVData, getPhoneNumber } from '../../services/auth/dataServices';
import { useTheme } from '../context/themeContext';

const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '').trim() : '';

// --- LÓGICA DE TEXTOS PROFESIONALES ---
const GET_DESC = (course, index) => {
    const isDone = course.progress >= 99 || course.completed;
    const name = course.fullname;

    // Texto solicitado por el usuario adaptado al estatus
    if (isDone) {
        return `Dominio en ${name}: Desarrollo de competencias analíticas y técnicas aplicadas al área, con un enfoque práctico en la resolución de problemas y la implementación de proyectos específicos del sector.`;
    } else {
        return `En formación: Desarrollo de competencias analíticas y técnicas aplicadas a ${name}, trabajando bajo un enfoque práctico en la resolución de problemas e implementación de proyectos institucionales.`;
    }
};

export default function CVGeneratorScreen() {
    const [data, setData] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('No disponible'); 
    const [loading, setLoading] = useState(true);
    const { theme, isDark } = useTheme();
    
    const loadData = useCallback(() => {
        (async () => {
            setLoading(true);
            try {
                const [userId, cvData] = await Promise.all([
                    AsyncStorage.getItem("moodleUserId"),
                    getCVData()
                ]);
                setData(cvData);
                if (userId) setPhoneNumber(await getPhoneNumber(parseInt(userId)));
            } catch (e) {
                Alert.alert("Error", "No se pudo sincronizar el perfil.");
            } finally { setLoading(false); }
        })();
    }, []); 

    useFocusEffect(loadData); 

    if (loading) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );

    const { userDetails: user, userCourses: courses, userBadges: badges } = data || {};
    const PRIMARY = isDark ? theme.primary : "#E83E4C"; 
    const TEXT_STYLE = { color: theme.text };
    const SUB_STYLE = { color: theme.textSecondary || '#666' };

    return (
        <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
            
            {/* 1. CABECERA */}
            <View style={styles.header}>
                <Image source={{ uri: user?.profileimageurl }} style={[styles.img, { borderColor: PRIMARY }]} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, TEXT_STYLE]}>{user?.fullname}</Text>
                    <Text style={[styles.job, { color: PRIMARY }]}>PERFIL ACADÉMICO PROFESIONAL</Text>
                    <Text style={[styles.contact, TEXT_STYLE]}>✉️ {user?.email}</Text>
                    <Text style={[styles.contact, TEXT_STYLE]}>📞 {phoneNumber}</Text>
                </View>
            </View>

            {/* 2. RESUMEN PROFESIONAL */}
            {user?.description && (
                <Section title="Resumen Ejecutivo" color={PRIMARY} textColor={theme.text}>
                    <View style={[styles.descBox, { borderLeftColor: PRIMARY }]}>
                        <Text style={[styles.descT, TEXT_STYLE]}>{stripHtml(user.description)}</Text>
                    </View>
                </Section>
            )}

            {/* 3. LOGROS / INSIGNIAS */}
            {badges?.length > 0 && (
                <Section title="Certificaciones Académicas" color={PRIMARY} textColor={theme.text}>
                    <View style={styles.badgeWrap}>
                        {badges.map((b, i) => (
                            <View key={i} style={[styles.badge, { backgroundColor: PRIMARY + '15', borderColor: theme.text + '20' }]}>
                                <Text style={[TEXT_STYLE, styles.badgeText]}>🏆 {b.name}</Text>
                            </View>
                        ))}
                    </View>
                </Section>
            )}

            {/* 4. HISTORIAL CON TEXTO SOLICITADO */}
            <Section title="Formación y Competencias" color={PRIMARY} textColor={theme.text}>
                {courses?.map((c, i) => (
                    <View key={c.id} style={styles.course}>
                        <Text style={[styles.cTitle, TEXT_STYLE]}>{c.fullname}</Text>
                        <Text style={[styles.cMeta, SUB_STYLE]}>{c.shortname.toUpperCase()} | Formación Técnica</Text>
                        <Text style={[styles.cDesc, SUB_STYLE]}>{GET_DESC(c, i)}</Text>
                    </View>
                ))}
            </Section>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

// Componente de Sección para limpieza de código
const Section = ({ title, color, textColor, children }) => (
    <View style={styles.sec}>
        <Text style={[styles.secT, { color: textColor }]}>{title}</Text>
        <View style={[styles.line, { backgroundColor: color }]} />
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: { padding: 25 },
    center: { flex: 1, justifyContent: 'center' },
    header: { flexDirection: 'row', marginBottom: 30, alignItems: 'center' },
    img: { width: 85, height: 85, borderRadius: 12, borderWidth: 2, marginRight: 15 },
    name: { fontSize: 22, fontWeight: 'bold' },
    job: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
    contact: { fontSize: 12, fontFamily: 'serif', marginTop: 2 },
    sec: { marginBottom: 35 },
    secT: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
    line: { height: 3, width: 40, marginTop: 4, marginBottom: 15 },
    descBox: { paddingLeft: 15, borderLeftWidth: 3, paddingVertical: 2 },
    descT: { fontSize: 14, fontFamily: 'serif', textAlign: 'justify', fontStyle: 'italic', lineHeight: 20 },
    badgeWrap: { flexDirection: 'row', flexWrap: 'wrap' },
    badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, marginRight: 8, marginBottom: 8 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    course: { marginBottom: 25 },
    cTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    cMeta: { fontSize: 11, fontWeight: '600', opacity: 0.7, marginBottom: 6 },
    cDesc: { fontSize: 13, fontFamily: 'serif', textAlign: 'justify', lineHeight: 18 }
});