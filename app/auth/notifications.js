import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calendar from 'expo-calendar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { GetMoodleCalendarEvents, GetMoodleNotifications } from "../../services/auth/tasks";
import { useTheme } from '../context/themeContext';

export default function NotificationsScreen() {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const PRIMARY_COLOR = isDark ? '#F55D69' : '#FF0000';

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
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} translucent={false} />
            
            <View style={[styles.headerWrapper, { backgroundColor: PRIMARY_COLOR }]}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.sideButton}>
                            <Ionicons name="arrow-back" size={28} color="white" />
                        </TouchableOpacity>

                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>Notificaciones</Text>
                        </View>

                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.sideButton}>
                            <Ionicons name="calendar-outline" size={28} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.container}>
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={80} color={isDark ? '#444' : '#CCC'} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No hay notificaciones nuevas.
                            </Text>
                        </View>
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

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Ionicons name="cloud-download-outline" size={50} color={PRIMARY_COLOR} />
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {t('calendar.modal_title')}
                        </Text>
                        <Text style={[styles.modalText, { color: theme.textSecondary }]}>
                            {t('calendar.modal_description')}
                        </Text>
                        
                        <TouchableOpacity 
                            style={[styles.btnAction, { backgroundColor: PRIMARY_COLOR }]}
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
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerWrapper: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    sideButton: { 
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: { 
        flex: 1 
    },
    card: { 
        padding: 15, 
        borderRadius: 12, 
        marginHorizontal: 20,
        marginBottom: 12, 
        borderLeftWidth: 5, 
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, 
        shadowRadius: 2,
    },
    cardTitle: { 
        fontWeight: 'bold', 
        marginBottom: 4, 
        fontSize: 16 
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 120
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        textAlign: 'center'
    },
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
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
    modalText: { textAlign: 'center', marginVertical: 15, fontSize: 14 },
    btnAction: {
        paddingVertical: 12,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center'
    },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});