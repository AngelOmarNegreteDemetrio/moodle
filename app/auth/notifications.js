import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calendar from 'expo-calendar';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { GetMoodleCalendarEvents, GetMoodleNotifications } from "../../services/auth/tasks";
import { useTheme } from '../context/themeContext';

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const loadRealNotifications = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("moodleToken");
            const userId = await AsyncStorage.getItem("moodleUserId"); 

            if (token && userId) {
                const data = await GetMoodleNotifications(token, userId);
                const realAlerts = data.map(notif => ({
                    id: notif.id.toString(),
                    title: notif.subject || t('notifications.default_title'),
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

    const handleSyncCalendar = async () => {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('calendar.permission_denied'), t('calendar.permission_denied'));
            return;
        }

        try {
            const token = await AsyncStorage.getItem("moodleToken");
            const events = await GetMoodleCalendarEvents(token);

            if (events.length === 0) {
                Alert.alert(t('calendar.no_events'), t('calendar.no_events'));
                setModalVisible(false);
                return;
            }

            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

            for (const event of events) {
                await Calendar.createEventAsync(defaultCalendar.id, {
                    title: event.name,
                    startDate: new Date(event.timestart * 1000),
                    endDate: new Date((event.timestart + (event.timeduration || 3600)) * 1000),
                    notes: event.description,
                    location: 'Plataforma Moodle',
                });
            }

            setModalVisible(false);
            Alert.alert(t('common.success'), t('calendar.sync_success'));
        } catch (error) {
            Alert.alert(t('common.error'), t('calendar.sync_error'));
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
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {t('notifications.title')}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name="calendar-outline" size={28} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                            <Ionicons name="cloud-download-outline" size={50} color={theme.primary} />
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {t('calendar.modal_title')}
                            </Text>
                            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
                                {t('calendar.modal_description')}
                            </Text>
                            
                            <TouchableOpacity 
                                style={[styles.btnAction, { backgroundColor: theme.primary }]}
                                onPress={handleSyncCalendar}
                            >
                                <Text style={styles.btnText}>{t('calendar.sync_now')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={{ color: '#FF4444', marginTop: 15, fontWeight: 'bold' }}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={
                        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 20 }}>
                            {t('notifications.empty')}
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 'bold' },
    card: { 
        padding: 15, borderRadius: 8, marginBottom: 12, borderLeftWidth: 5, 
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2, shadowRadius: 1.41,
    },
    cardTitle: { fontWeight: 'bold', marginBottom: 4 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '85%',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
    modalText: { textAlign: 'center', marginVertical: 15, fontSize: 14 },
    btnAction: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center'
    },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});