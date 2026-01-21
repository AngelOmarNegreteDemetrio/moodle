import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCVData } from '../../services/auth/dataServices';
import { useTheme } from '../context/themeContext';

const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '').trim() : '';

const GET_DESC = (course, t) => {
    const isDone = course.progress >= 99 || course.completed;
    const name = course.fullname;
    const base = t('cv.course_description', { name }); 
    return isDone ? `${t('cv.mastery')} ${name}: ${base}` : `${t('cv.training')}: ${base}`;
};

export default function CVGeneratorScreen() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme, isDark } = useTheme();
    
    const loadData = useCallback(() => {
        let isActive = true;
        (async () => {
            setLoading(true);
            try {
                const cvData = await getCVData();
                if (isActive && cvData) setData(cvData);
            } catch (e) {
                Alert.alert(t('common.error'), t('cv.sync_error'));
            } finally { 
                if (isActive) setLoading(false); 
            }
        })();
        return () => { isActive = false; };
    }, [t]); 

    useFocusEffect(loadData); 

    if (loading) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );

    const { userDetails: user, userCourses: courses } = data || {};
    const PRIMARY = isDark ? theme.primary : "#E83E4C"; 
    const TEXT = { color: theme.text };
    const SUB = { color: isDark ? '#AAA' : '#666' };

    return (
        <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
            
            <View style={styles.row}>
                <Image source={{ uri: user?.profileimageurl || 'https://via.placeholder.com/150' }} style={[styles.img, { borderColor: PRIMARY }]} />
                <View style={styles.flex}>
                    <Text style={[styles.name, TEXT]}>{user?.fullname}</Text>
                    <Text style={[styles.job, { color: PRIMARY }]}>{t('cv.profile_title')}</Text>
                    <Text style={[styles.contact, TEXT]}>✉️ {user?.email}</Text>
                    <Text style={[styles.contact, TEXT]}>📞 {user?.phone2 || user?.phone1 || t('cv.no_phone')}</Text>
                </View>
            </View>

            {user?.description && (
                <Section title={t('cv.summary_title')} color={PRIMARY} theme={theme}>
                    <View style={[styles.descBox, { borderLeftColor: PRIMARY }]}>
                        <Text style={[styles.descT, TEXT]}>{stripHtml(user.description)}</Text>
                    </View>
                </Section>
            )}

            <Section title={t('cv.formation_title')} color={PRIMARY} theme={theme}>
                {courses?.map((c, i) => (
                    <View key={c.id || i} style={styles.itemSpace}>
                        <Text style={[styles.bold16, TEXT]}>{c.fullname}</Text>
                        <Text style={[styles.meta, { color: PRIMARY }]}>{t('cv.moodle_certified')}</Text>
                        <Text style={[styles.justify13, SUB]}>{GET_DESC(c, t)}</Text>
                    </View>
                ))}
            </Section>
        </ScrollView>
    );
}

const Section = ({ title, color, theme, children }) => (
    <View style={styles.sec}>
        <Text style={[styles.secT, { color: theme.text }]}>{title}</Text>
        <View style={[styles.line, { backgroundColor: color }]} />
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: { padding: 25, paddingBottom: 50 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 35 },
    flex: { flex: 1 },
    itemSpace: { marginBottom: 30 },
    img: { width: 90, height: 90, borderRadius: 15, borderWidth: 2, marginRight: 15 },
    line: { height: 3, width: 35, marginTop: 5, marginBottom: 20 },
    descBox: { paddingLeft: 15, borderLeftWidth: 3, paddingVertical: 2 },
    sec: { marginBottom: 35 },
    name: { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5 },
    job: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
    contact: { fontSize: 12, marginBottom: 2, opacity: 0.9 },
    secT: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    bold16: { fontSize: 16, fontWeight: 'bold' },
    meta: { fontSize: 10, fontWeight: 'bold', marginBottom: 8, opacity: 0.8 },
    justify13: { fontSize: 13, textAlign: 'justify', lineHeight: 20 },
    descT: { fontSize: 14, fontStyle: 'italic', lineHeight: 22, textAlign: 'justify' }
});