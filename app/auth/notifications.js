// app/auth/notifications.js
import { Ionicons } from '@expo/vector-icons'; // Para el icono del botón
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calendar from 'expo-calendar'; // Librería nativa
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { useTheme } from '../context/themeContext';

// Importamos ambas funciones desde tasks.js
import { GetMoodleCalendarEvents, GetMoodleNotifications } from "../../services/auth/tasks";

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false); // Control del Modal

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

    // FUNCIÓN PARA SINCRONIZAR CALENDARIO NATIVO
    const handleSyncCalendar = async () => {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permiso requerido", "Necesitamos acceso al calendario para sincronizar tareas.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("moodleToken");
            const events = await GetMoodleCalendarEvents(token);

            if (events.length === 0) {
                Alert.alert("Sin eventos", "No se encontraron eventos próximos en Moodle.");
                setModalVisible(false);
                return;
            }

            // Buscar calendario principal del teléfono
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
            Alert.alert("¡Éxito!", "Tareas sincronizadas con el calendario de tu teléfono.");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo sincronizar el calendario.");
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
                {/* CABECERA CON BOTÓN DE CALENDARIO */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Notificaciones</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name="calendar-outline" size={28} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                {/* MODAL EMERGENTE */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                            <Ionicons name="cloud-download-outline" size={50} color={theme.primary} />
                            <Text style={[styles.modalTitle, { color: theme.text }]}>¿Sincronizar Calendario?</Text>
                            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
                                Se añadirán tus fechas de entrega de Moodle a la agenda de tu teléfono.
                            </Text>
                            
                            <TouchableOpacity 
                                style={[styles.btnAction, { backgroundColor: theme.primary }]}
                                onPress={handleSyncCalendar}
                            >
                                <Text style={styles.btnText}>Sincronizar ahora</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={{ color: '#FF4444', marginTop: 15, fontWeight: 'bold' }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 'bold' },
    card: { 
        padding: 15, borderRadius: 8, marginBottom: 12, borderLeftWidth: 5, 
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2, shadowRadius: 1.41,
    },
    cardTitle: { fontWeight: 'bold', marginBottom: 4 },
    // ESTILOS DEL MODAL
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