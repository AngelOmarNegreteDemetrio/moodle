/* --- app/index.js (Perfil Optimizado y Dinámico) --- */
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { useTheme } from '../app/context/themeContext';
import Header from '../components/navigation/menu';
import { GetUserBadges } from "../services/auth/tasks";
import { GetUserInfoService } from "../services/auth/userServices";

export default function HomeScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme(); 
    const [userData, setUserData] = useState(null);
    const [badges, setBadges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const primaryColor = isDark ? '#F55D69' : theme.primary; 
    const secondaryText = isDark ? '#AAAAAA' : '#666666';

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchAllData = async () => {
                setIsLoading(true);
                try {
                    const token = await AsyncStorage.getItem("moodleToken");
                    const userId = await AsyncStorage.getItem("moodleUserId");
                    const username = await AsyncStorage.getItem("lastLoggedInUsername");

                    if (!token || !username) {
                        router.replace("/auth/Login");
                        return;
                    }

                    const data = await GetUserInfoService(username, 'username');
                    const badgesData = await GetUserBadges(token, userId);

                    if (isActive && data) {
                        setUserData({
                            name: data.fullname,
                            grade: data.userGrade, 
                            email: data.email,
                            profileImageUrl: data.profileimageurl,
                            city: data.city,
                            idnumber: data.idnumber, 
                            level: data.department, // Mapeado directamente de Moodle
                            school: "Nuevo Horizontes Global School"
                        });
                        setBadges(badgesData);
                    }
                } catch (error) {
                    console.error("Error Moodle:", error);
                } finally {
                    if (isActive) setIsLoading(false);
                }
            };
            fetchAllData();
            return () => { isActive = false; };
        }, [])
    );

    if (isLoading || !userData) {
        return (
            <View style={[styles.center, {backgroundColor: theme.background}]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: primaryColor }}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={primaryColor} />
            <Header hasNotifications={true} />

            <ScrollView style={{ backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
                
                {/* CABECERA */}
                <View style={styles.sectionCenter}>
                    <View style={[styles.profileCircle, { backgroundColor: theme.card, borderColor: isDark ? theme.border : '#FFF' }]}>
                        <Image source={{ uri: userData.profileImageUrl || 'https://via.placeholder.com/150' }} style={styles.fullImg} />
                    </View>
                    <Text style={[styles.title, { color: theme.text, marginTop: 15 }]}>{userData.name}</Text>
                    {userData.grade && (
                        <View style={[styles.badgeContainer, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{userData.grade}</Text>
                        </View>
                    )}
                </View>

                {/* MEDALLAS */}
                <View style={styles.container}>
                    <View style={styles.rowBetween}>
                        <Text style={[styles.subTitle, { color: theme.text }]}>Mis Medallas</Text>
                        <View style={styles.counter}><Text style={styles.counterText}>{badges.length}</Text></View>
                    </View>
                    
                    <FlatList
                        data={badges}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id?.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.badgeItem}>
                                <View style={[styles.badgeCircle, { backgroundColor: theme.card }]}>
                                    <Image source={{ uri: item.badgeurl }} style={styles.fullImg} resizeMode="contain" />
                                </View>
                                <Text numberOfLines={1} style={[styles.smallText, { color: theme.text }]}>{item.name}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={{color: secondaryText, padding: 10}}>Sin medallas aún.</Text>}
                    />
                </View>

                {/* EXPEDIENTE - Simplificado */}
                <View style={styles.container}>
                    <Text style={[styles.subTitle, { color: theme.text }]}>Detalles del Expediente</Text>
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <InfoRow icon="finger-print" label="Matrícula" value={userData.idnumber || "No asignada"} color="#E83E4C" theme={theme} />
                        <View style={[styles.sep, { backgroundColor: theme.border }]} />
                        <InfoRow icon="school" label="Nivel" value={userData.level || "General"} color="#49B6CC" theme={theme} />
                        <View style={[styles.sep, { backgroundColor: theme.border }]} />
                        <InfoRow icon="mail" label="Correo" value={userData.email} color="#6C5CE7" theme={theme} />
                        <View style={[styles.sep, { backgroundColor: theme.border }]} />
                        <InfoRow icon="location" label="Ciudad" value={userData.city || "Aguascalientes"} color="#FFA500" theme={theme} />
                    </View>
                </View>

                <View style={styles.sectionCenter}>
                    <Text style={{ fontSize: 12, color: secondaryText, marginVertical: 30 }}>{userData.school}</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const InfoRow = ({ icon, label, value, color, theme }) => (
    <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionCenter: { alignItems: 'center', paddingVertical: 20 },
    container: { paddingHorizontal: 20, marginTop: 20 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    card: { borderRadius: 20, padding: 12, elevation: 3 },
    
    // Perfil
    profileCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, overflow: 'hidden', elevation: 10 },
    title: { fontSize: 22, fontWeight: 'bold' },
    badgeContainer: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginTop: 8 },
    
    // Medallas
    badgeItem: { alignItems: 'center', marginRight: 15, width: 70 },
    badgeCircle: { width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    
    // Textos y utilidades
    subTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 },
    label: { fontSize: 10, color: '#888', fontWeight: 'bold', textTransform: 'uppercase' },
    value: { fontSize: 15, fontWeight: '500' },
    smallText: { fontSize: 10, marginTop: 5, textAlign: 'center' },
    sep: { height: 1, width: '85%', alignSelf: 'flex-end', opacity: 0.1 },
    iconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    fullImg: { width: '100%', height: '100%' },
    counter: { backgroundColor: '#49B6CC', paddingHorizontal: 8, borderRadius: 10 },
    counterText: { color: 'white', fontSize: 11, fontWeight: 'bold' }
});