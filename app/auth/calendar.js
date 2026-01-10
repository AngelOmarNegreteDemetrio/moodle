import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GetMoodleCalendarEvents } from '../../services/auth/tasks';
import { useTheme } from '../context/themeContext';

const COLLEGE_COLORS = {
    COLOR_CLARO_COINCIDENTE: '#FF0000',
    COLOR_OSCURO_COINCIDENTE: '#F55D69',
    WHITE: '#FFFFFF',
};

export default function CalendarScreen() {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const PRIMARY_COLOR = isDark 
        ? COLLEGE_COLORS.COLOR_OSCURO_COINCIDENTE 
        : COLLEGE_COLORS.COLOR_CLARO_COINCIDENTE;

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const token = await AsyncStorage.getItem("moodleToken");
            if (token) {
                const data = await GetMoodleCalendarEvents(token);
                setEvents(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const syncToNativeCalendar = async () => {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('common.error'), t('calendar.permission_denied', 'Se requieren permisos de calendario'));
            return;
        }

        try {
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

            for (const event of events) {
                await Calendar.createEventAsync(defaultCalendar.id, {
                    title: event.name,
                    startDate: new Date(event.timestart * 1000),
                    endDate: new Date((event.timestart + (event.timeduration || 3600)) * 1000),
                    notes: event.description,
                    location: 'Moodle Platform',
                });
            }
            Alert.alert(t('common.success', '¡Éxito!'), t('calendar.sync_success', 'Eventos sincronizados'));
        } catch (error) {
            Alert.alert(t('common.error'), t('calendar.sync_error', 'No se pudo sincronizar'));
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>
                {t('calendar.title', 'Calendario Moodle')}
            </Text>
            
            <TouchableOpacity 
                style={[styles.syncButton, { backgroundColor: PRIMARY_COLOR }]}
                onPress={syncToNativeCalendar}
            >
                <Text style={styles.syncButtonText}>
                    {t('calendar.sync_button', 'Sincronizar con mi Celular')}
                </Text>
            </TouchableOpacity>

            <FlatList
                data={events}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.card, shadowColor: '#000' }]}>
                        <Text style={[styles.eventTitle, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.eventDate, { color: theme.textSecondary || '#666' }]}>
                            {new Date(item.timestart * 1000).toLocaleDateString()}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.text }]}>
                        {t('calendar.no_events', 'No hay eventos próximos.')}
                    </Text>
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    syncButton: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    syncButtonText: { color: COLLEGE_COLORS.WHITE, fontWeight: 'bold', fontSize: 16 },
    card: { 
        padding: 15, 
        borderRadius: 10, 
        marginBottom: 12, 
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    eventTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    eventDate: { fontSize: 14 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
    listContent: { paddingBottom: 20 }
});