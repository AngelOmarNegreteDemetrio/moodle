// services/auth/tasks.js
import axios from "axios";
import { API_URL } from "../../constants/url";

// Esta es la función que habilitaste en tu captura de Moodle
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
        console.error("Error al conectar con Moodle:", error);
        throw error;
    }
};