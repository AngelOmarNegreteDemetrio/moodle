import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from "../../constants/url";

// 🚨 Obtener detalles básicos del usuario 🚨
async function fetchUserDetails(token, userId) {
    const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
        params: {
            wstoken: token,
            moodlewsrestformat: 'json',
            wsfunction: 'core_user_get_users_by_field',
            field: 'id',
            values: [userId],
        }
    });

    if (response.data && response.data.length > 0) {
        return response.data[0];
    }
    return {}; 
}

// 🔑 Obtener el teléfono (Requiere permisos core_user_get_users) 🔑
export async function getPhoneNumber(userId) {
    const token = await AsyncStorage.getItem("moodleToken");
    if (!token || !userId) return 'No disponible';

    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                moodlewsrestformat: 'json',
                wsfunction: 'core_user_get_users',
                criteria: [{ key: 'id', value: userId.toString() }],
            }
        });

        if (response.data && response.data.users && response.data.users.length > 0) {
            const user = response.data.users[0];
            const phone = user.phone || user.mobile || user.phone1 || user.phone2 || '';
            return phone.trim().replace(/\s+/g, '') || 'No disponible';
        }
        return 'No disponible';
    } catch (error) {
        console.warn("Fallo al obtener teléfono.", error.message);
        return 'No disponible';
    }
}

// 📚 Obtener cursos inscritos 📚
async function fetchUserCourses(token, userId) {
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                moodlewsrestformat: 'json',
                wsfunction: 'core_enrol_get_users_courses',
                userid: userId,
            }
        });

        if (response.data && !response.data.exception) {
            return response.data.filter(course => course.id !== 1);
        }
        return [];
    } catch (error) {
        console.warn("Fallo en core_enrol_get_users_courses.");
        return [];
    }
}

// 🏆 Obtener insignias del usuario 🏆
async function fetchUserBadges(token, userId) {
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                moodlewsrestformat: 'json',
                wsfunction: 'core_badges_get_user_badges',
                userid: userId,
            }
        });

        if (response.data && response.data.badges) {
            return response.data.badges;
        }
        return [];
    } catch (error) {
        console.warn("Fallo al obtener insignias (Check token permissions).", error.message);
        return [];
    }
}

// 🔄 Función unificada para el CV 🔄
export async function getCVData() {
    const token = await AsyncStorage.getItem("moodleToken");
    const userId = await AsyncStorage.getItem("moodleUserId");
    
    if (!token || !userId) {
        throw new Error("Sesión no activa.");
    }

    const numericUserId = parseInt(userId);

    try {
        const [userDetails, userCourses, userBadges] = await Promise.all([
            fetchUserDetails(token, numericUserId),
            fetchUserCourses(token, numericUserId),
            fetchUserBadges(token, numericUserId),
        ]);

        return {
            userDetails,
            userCourses,
            userBadges,
        };
    } catch (error) {
        throw new Error(`Error de conexión Moodle: ${error.message}`);
    }
}