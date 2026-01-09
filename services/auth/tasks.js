// services/auth/tasks.js
import axios from "axios";
import { API_URL } from "../../constants/url";

// Función para notificaciones (Sin cambios)
export const GetMoodleNotifications = async (token, userId) => {
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: 'message_popup_get_popup_notifications',
                moodlewsrestformat: 'json',
                useridto: userId
            }
        });
        return response.data.notifications || [];
    } catch (error) {
        console.error("Error al conectar con Moodle (Notificaciones):", error);
        throw error;
    }
};

// Función para el calendario (Sin cambios)
export const GetMoodleCalendarEvents = async (token) => {
    try {
        const timeFrom = Math.floor(Date.now() / 1000); 
        const timeTo = timeFrom + (60 * 24 * 60 * 60); 

        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: 'core_calendar_get_calendar_events',
                moodlewsrestformat: 'json',
                timefrom: timeFrom,
                timeto: timeTo
            }
        });
        return response.data.events || [];
    } catch (error) {
        console.error("Error al conectar con Moodle (Calendario):", error);
        throw error;
    }
};

// 🌟 NUEVA FUNCIÓN PARA LAS INSIGNIAS (BADGES) 🌟
export const GetUserBadges = async (token, userId) => {
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: 'core_badges_get_user_badges', // La función que activaste en Moodle
                moodlewsrestformat: 'json',
                userid: userId 
            }
        });
        // Retornamos el array de insignias
        return response.data.badges || [];
    } catch (error) {
        console.error("Error al conectar con Moodle (Insignias):", error);
        return []; // Retornamos vacío para no romper la UI si falla
    }
};