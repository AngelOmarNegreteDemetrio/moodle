// app/auth/notifications.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useTheme } from '../context/themeContext';

// 🚨 AQUÍ ESTÁ EL CAMBIO: Apuntamos directamente a tasks.js
import { GetMoodleNotifications } from "../../services/auth/tasks";

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRealNotifications = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("moodleToken");
            const userId = await AsyncStorage.getItem("moodleUserId"); 
            

            if (token && userId) {
                const data = await GetMoodleNotifications(token, userId);
                
                const realAlerts = data.map(notif => ({
                    id: notif.id.toString(),
                    title: notif.subject || "Notificación de Moodle",
                    msg: notif.fullmessagehtml 
                        ? notif.fullmessagehtml.replace(/<[^>]*>?/gm, '') 
                        : notif.smallmessage,
                    type: notif.component.includes('assign') ? 'urgent' : 'info'
                }));
                
                setNotifications(realAlerts);
            }
        } catch (error) {
            console.log("Error al cargar datos reales");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadRealNotifications(); }, []));

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>Notificaciones</Text>
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={
                        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 20 }}>
                            No hay notificaciones nuevas en Moodle.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={() => Vibration.vibrate(10)}
                            style={[
                                styles.card, 
                                { 
                                    backgroundColor: theme.card, 
                                    borderLeftColor: item.type === 'urgent' ? '#FF0000' : '#2196F3' 
                                }
                            ]}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                            <Text style={{ color: theme.textSecondary }}>{item.msg}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    card: { 
        padding: 15, borderRadius: 8, marginBottom: 12, borderLeftWidth: 5, 
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2, shadowRadius: 1.41,
    },
    cardTitle: { fontWeight: 'bold', marginBottom: 4 }
});