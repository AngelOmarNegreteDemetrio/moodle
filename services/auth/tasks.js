import axios from "axios";
import { API_URL } from "../../constants/url";

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
        console.error("Error GetMoodleNotifications:", error);
        throw error;
    }
};

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
        console.error("Error GetMoodleCalendarEvents:", error);
        throw error;
    }
};

export const GetUserBadges = async (token, userId) => {
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: 'core_badges_get_user_badges',
                moodlewsrestformat: 'json',
                userid: userId 
            }
        });
        return response.data.badges || [];
    } catch (error) {
        console.error("Error GetUserBadges:", error);
        return [];
    }
};

export const SearchMoodleUsers = async (token, query) => {
    console.log("--- INICIANDO BÚSQUEDA EN MOODLE PARA: " + query + " ---");
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: 'core_user_search_identity',
                moodlewsrestformat: 'json',
                query: query
            }
        });

        console.log("RESPUESTA CRUDA DE MOODLE:", response.data);

        if (Array.isArray(response.data)) {
            return { contacts: response.data };
        }
        
        return { contacts: [] };
    } catch (error) {
        console.error("ERROR DE CONEXIÓN AXIOS:", error);
        return { contacts: [] };
    }
};

export const GetUserConversations = async (token, userId) => {
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: 'core_message_get_conversations',
                moodlewsrestformat: 'json',
                userid: userId
            }
        });
        return response.data.conversations || [];
    } catch (error) {
        console.error("Error GetUserConversations:", error);
        return [];
    }
};

export const GetChatMessages = async (token, userId, conversationId) => {
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: 'core_message_get_conversation_messages',
                moodlewsrestformat: 'json',
                userid: userId,
                convid: conversationId,
                limitnum: 50
            }
        });
        return response.data.messages || [];
    } catch (error) {
        console.error("Error GetChatMessages:", error);
        return [];
    }
};

export const SendMoodleMessage = async (token, conversationId, text, touserid = null) => {
    try {
        if (conversationId) {
            const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: 'core_message_send_messages_to_conversation',
                    moodlewsrestformat: 'json',
                    conversationid: conversationId,
                    'messages[0][text]': text,
                    'messages[0][textformat]': 1
                }
            });
            return response.data;
        } else if (touserid) {
            const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: 'core_message_send_instant_messages',
                    moodlewsrestformat: 'json',
                    'messages[0][touserid]': touserid,
                    'messages[0][text]': text
                }
            });
            return response.data;
        }
    } catch (error) {
        console.error("Error SendMoodleMessage:", error);
        throw error;
    }
};