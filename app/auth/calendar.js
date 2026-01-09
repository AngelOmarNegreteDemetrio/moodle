import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GetMoodleCalendarEvents } from '../../services/auth/tasks'; // La función que creamos
import { useTheme } from '../context/themeContext';

export default function CalendarScreen() {
    const { theme } = useTheme();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // FUNCIÓN PARA SINCRONIZAR CON EL CELULAR
    const syncToNativeCalendar = async () => {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permiso denegado", "Necesitamos acceso al calendario para sincronizar.");
            return;
        }

        try {
            // 1. Buscamos o creamos un calendario específico para la App
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

            // 2. Insertamos cada evento de Moodle
            for (const event of events) {
                await Calendar.createEventAsync(defaultCalendar.id, {
                    title: event.name,
                    startDate: new Date(event.timestart * 1000),
                    endDate: new Date((event.timestart + event.timeduration || 3600) * 1000),
                    notes: event.description,
                    location: 'Moodle Platform',
                });
            }
            Alert.alert("¡Éxito!", "Eventos sincronizados con el calendario de tu teléfono.");
        } catch (error) {
            Alert.alert("Error", "No se pudo sincronizar el calendario.");
        }
    };

    if (loading) return <ActivityIndicator style={{flex:1}} />;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Calendario Moodle</Text>
            
            <TouchableOpacity 
                style={[styles.syncButton, { backgroundColor: theme.primary }]}
                onPress={syncToNativeCalendar}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sincronizar con mi Celular</Text>
            </TouchableOpacity>

            <FlatList
                data={events}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <Text style={[styles.eventTitle, { color: theme.text }]}>{item.name}</Text>
                        <Text style={{ color: theme.textSecondary }}>
                            {new Date(item.timestart * 1000).toLocaleDateString()}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={{color: theme.text, textAlign:'center'}}>No hay eventos próximos.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    syncButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    card: { padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
    eventTitle: { fontWeight: 'bold', fontSize: 16 }
});