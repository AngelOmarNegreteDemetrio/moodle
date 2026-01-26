import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from "../../constants/url";

export async function getUserBadges() {
    const token = await AsyncStorage.getItem("moodleToken");
    const userId = await AsyncStorage.getItem("moodleUserId");
    if (!token || !userId) return [];
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                moodlewsrestformat: 'json',
                wsfunction: 'core_badges_get_user_badges',
                userid: parseInt(userId),
            }
        });
        return response.data?.badges || [];
    } catch (error) {
        return [];
    }
}

export async function getCVData() {
    const token = await AsyncStorage.getItem("moodleToken");
    const userId = await AsyncStorage.getItem("moodleUserId");
    if (!token || !userId) throw new Error("Sesión no activa.");

    const numericUserId = parseInt(userId);

    try {
        const [userBadges, userDetailsResponse, userCoursesResponse] = await Promise.all([
            getUserBadges(),
            axios.get(`${API_URL}/webservice/rest/server.php`, {
                params: { 
                    wstoken: token, 
                    moodlewsrestformat: 'json', 
                    wsfunction: 'core_user_get_users_by_field', 
                    field: 'id', 
                    'values[0]': numericUserId 
                }
            }),
            axios.get(`${API_URL}/webservice/rest/server.php`, {
                params: { 
                    wstoken: token, 
                    moodlewsrestformat: 'json', 
                    wsfunction: 'core_enrol_get_users_courses', 
                    userid: numericUserId 
                }
            })
        ]);

        const rawUser = userDetailsResponse.data?.[0] || {};

        return {
            userDetails: {
                ...rawUser,
                phone: rawUser.phone2 || rawUser.phone1 || 'No disponible',
                location: rawUser.city && rawUser.country ? `${rawUser.city}, ${rawUser.country}` : rawUser.city || rawUser.country || '',
                department: rawUser.department || rawUser.institution || ''
            },
            userCourses: userCoursesResponse.data?.filter(c => c.id !== 1) || [],
            userBadges,
        };
    } catch (error) {
        console.error("Error en getCVData:", error);
        throw new Error("Error de conexión con Moodle");
    }
}