import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../app/context/themeContext';
import Header from '../components/navigation/menu';
import { GetUserBadges } from "../services/auth/tasks";
import { GetUserInfoService } from "../services/auth/userServices";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { t, i18n } = useTranslation(); 
    const { theme, isDark } = useTheme(); 
    const [userData, setUserData] = useState(null);
    const [badges, setBadges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const primaryColor = isDark ? '#F55D69' : '#FF0000'; 
    const darkGray = '#1A1A1A';

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchAllData = async () => {
                try {
                    const token = await AsyncStorage.getItem("moodleToken");
                    const userId = await AsyncStorage.getItem("moodleUserId");
                    const username = await AsyncStorage.getItem("lastLoggedInUsername");

                    if (!token || !username) {
                        if (isActive) setIsLoading(false);
                        return;
                    }

                    const data = await GetUserInfoService(username, 'username');
                    const badgesData = await GetUserBadges(token, userId);

                    if (isActive && data) {
                        const nivel = data.department || "";
                        const grado = data.userGrade || "";
                        
                        let displayGrade = "";
                        if (grado && nivel) {
                            displayGrade = grado.toLowerCase().includes(nivel.toLowerCase()) 
                                ? grado.toUpperCase() 
                                : `${grado} DE ${nivel.toUpperCase()}`;
                        } else {
                            displayGrade = grado || nivel || "ESTUDIANTE";
                        }

                        setUserData({
                            name: data.fullname || `${data.firstname} ${data.lastname}`,
                            email: data.email,
                            profileImageUrl: data.profileimageurl,
                            city: data.city || "Aguascalientes",
                            country: data.country || "Mexico",
                            idnumber: data.idnumber || "N/A", 
                            fullGrade: displayGrade,
                            description: data.description,
                            school: data.institution || "Nuevo Horizontes Global School",
                            phone: data.phone1 || data.phone2 || data.phone || "No disponible",
                            academicScore: 9.4
                        });
                        setBadges(badgesData || []);
                    }
                } catch (error) {
                    console.error("Error Moodle:", error);
                } finally {
                    if (isActive) setIsLoading(false);
                }
            };

            fetchAllData();
            return () => { isActive = false; };
        }, [i18n.language])
    );

    if (isLoading || !userData) {
        return (
            <View style={[styles.center, {backgroundColor: theme.background}]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: darkGray }} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={darkGray} />
            <Header hasNotifications={true} />

            <ScrollView 
                style={{ backgroundColor: theme.background }} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={[styles.upperHeader, { backgroundColor: darkGray }]}>
                    <View style={[styles.profileContainer, { borderColor: theme.background, backgroundColor: theme.card }]}>
                        <Image 
                            source={{ uri: userData.profileImageUrl || 'https://via.placeholder.com/150' }} 
                            style={styles.profileImg} 
                        />
                    </View>
                </View>

                <View style={styles.infoMain}>
                    <View style={styles.statusRow}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.statusText}>Estudiante Activo</Text>
                    </View>
                    <Text style={[styles.userName, { color: theme.text }]}>{userData.name}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    
                    <View style={styles.tagWrapper}>
                        <View style={[styles.combinedBadge, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '30' }]}>
                            <Ionicons name="school-outline" size={14} color={primaryColor} style={{marginRight: 6}} />
                            <Text style={[styles.combinedBadgeText, { color: primaryColor }]}>
                                {userData.fullGrade}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.container}>
                    <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
                        <View style={styles.scoreHeader}>
                            <Text style={[styles.scoreLabel, { color: theme.text }]}>Rendimiento Académico</Text>
                            <Text style={[styles.scoreValue, { color: primaryColor }]}>{userData.academicScore}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { backgroundColor: primaryColor, width: `${(userData.academicScore / 10) * 100}%` }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.container}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Expediente Escolar</Text>
                    <View style={[styles.fullCard, { backgroundColor: theme.card }]}>
                        <DetailRow icon="id-card-outline" label="Matrícula" value={userData.idnumber} theme={theme} />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <DetailRow icon="business-outline" label="Institución" value={userData.school} theme={theme} />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <DetailRow icon="call-outline" label="Teléfono" value={userData.phone} theme={theme} />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <DetailRow icon="location-outline" label="Ciudad" value={`${userData.city}, ${userData.country}`} theme={theme} />
                    </View>
                </View>

                {userData.description && (
                    <View style={styles.container}>
                        <View style={[styles.bioCard, { backgroundColor: theme.card }]}>
                            <Text style={[styles.bioText, { color: theme.text }]}>
                                "{userData.description.replace(/<[^>]*>?/gm, '')}"
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.container}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Medallas Obtenidas</Text>
                        <View style={[styles.countBadge, { backgroundColor: primaryColor }]}>
                            <Text style={styles.countText}>{badges.length}</Text>
                        </View>
                    </View>
                    <FlatList
                        data={badges}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.medalItem}>
                                <View style={[styles.medalCircle, { backgroundColor: theme.card }]}>
                                    <Image source={{ uri: item.badgeurl }} style={styles.medalImg} />
                                </View>
                                <Text numberOfLines={1} style={[styles.medalName, { color: theme.text }]}>{item.name}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>Sin medallas aún</Text>}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.text }]}>NH Global School</Text>
                    <Text style={styles.versionText}>Versión 2.0.26</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const DetailRow = ({ icon, label, value, theme }) => (
    <View style={styles.detailRow}>
        <Ionicons name={icon} size={20} color="#49B6CC" style={{ width: 30 }} />
        <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    upperHeader: { height: 80, alignItems: 'center', justifyContent: 'flex-end', zIndex: 1 },
    profileContainer: { width: 110, height: 110, borderRadius: 55, borderWidth: 5, overflow: 'hidden', marginBottom: -55, elevation: 8 },
    profileImg: { width: '100%', height: '100%' },
    infoMain: { marginTop: 65, alignItems: 'center', paddingHorizontal: 20 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: '700', color: '#4CAF50', textTransform: 'uppercase' },
    userName: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
    userEmail: { fontSize: 14, color: '#888', marginTop: 2 },
    tagWrapper: { marginTop: 15 },
    combinedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
    combinedBadgeText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
    container: { paddingHorizontal: 20, marginTop: 25 },
    scoreCard: { padding: 20, borderRadius: 25, elevation: 3 },
    scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    scoreLabel: { fontSize: 15, fontWeight: '700', opacity: 0.8 },
    scoreValue: { fontSize: 22, fontWeight: '900' },
    progressBarBg: { height: 8, backgroundColor: '#E0E0E030', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    bioCard: { padding: 20, borderRadius: 20, borderLeftWidth: 4, borderLeftColor: '#49B6CC' },
    bioText: { fontSize: 14, fontStyle: 'italic', lineHeight: 22, opacity: 0.7, textAlign: 'center' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', opacity: 0.4, marginBottom: 10 },
    countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    countText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    medalItem: { alignItems: 'center', marginRight: 15, width: 70 },
    medalCircle: { width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    medalImg: { width: '70%', height: '70%' },
    medalName: { fontSize: 10, marginTop: 5, textAlign: 'center' },
    fullCard: { borderRadius: 20, padding: 15, elevation: 2 },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    detailLabel: { fontSize: 10, color: '#888', fontWeight: '700', textTransform: 'uppercase' },
    detailValue: { fontSize: 14, fontWeight: '600' },
    divider: { height: 1, opacity: 0.05, marginVertical: 2 },
    footer: { alignItems: 'center', marginTop: 40, marginBottom: 20, opacity: 0.3 },
    footerText: { fontSize: 11, fontWeight: '700' },
    versionText: { fontSize: 10 },
    emptyText: { opacity: 0.4, fontSize: 12 }
});