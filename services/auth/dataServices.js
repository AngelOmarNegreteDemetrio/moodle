import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from "../../constants/url";

// 🏆 Obtener insignias del usuario
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
        return response.data?.badges || [];
    } catch (error) {
        return [];
    }
}

// 🔑 Obtener teléfono desde la sección "Optional" (phone1 y phone2)
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

        if (response.data?.users?.length > 0) {
            const user = response.data.users[0];
            // Moodle mapea "Phone" como phone1 y "Mobile phone" como phone2
            const phone = user.phone2 || user.phone1 || '';
            return phone.trim() || 'No disponible';
        }
        return 'No disponible';
    } catch (error) {
        return 'No disponible';
    }
}

// 🔄 Obtener todos los datos para el CV
export async function getCVData() {
    const token = await AsyncStorage.getItem("moodleToken");
    const userId = await AsyncStorage.getItem("moodleUserId");
    if (!token || !userId) throw new Error("Sesión no activa.");

    const numericUserId = parseInt(userId);

    try {
        const [userBadges, userDetailsResponse, userCoursesResponse] = await Promise.all([
            fetchUserBadges(token, numericUserId),
            axios.get(`${API_URL}/webservice/rest/server.php`, {
                params: { wstoken: token, moodlewsrestformat: 'json', wsfunction: 'core_user_get_users_by_field', field: 'id', values: [numericUserId] }
            }),
            axios.get(`${API_URL}/webservice/rest/server.php`, {
                params: { wstoken: token, moodlewsrestformat: 'json', wsfunction: 'core_enrol_get_users_courses', userid: numericUserId }
            })
        ]);

        return {
            userDetails: userDetailsResponse.data?.[0] || {},
            userCourses: userCoursesResponse.data?.filter(c => c.id !== 1) || [],
            userBadges,
        };
    } catch (error) {
        throw new Error("Error de conexión con Moodle");
    }
}