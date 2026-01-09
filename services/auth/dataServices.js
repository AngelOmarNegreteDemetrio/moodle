/* --- services/auth/dataServices.js --- */
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

// 🔑 CORRECCIÓN: Obtener teléfono (phone1 y phone2)
export async function getPhoneNumber(userId) {
    const token = await AsyncStorage.getItem("moodleToken");
    if (!token || !userId) return 'No disponible';

    try {
        // IMPORTANTE: Moodle requiere que los criterios vayan indexados [0], [1], etc.
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                moodlewsrestformat: 'json',
                wsfunction: 'core_user_get_users',
                'criteria[0][key]': 'id',
                'criteria[0][value]': userId.toString(),
            }
        });

        if (response.data?.users?.length > 0) {
            const user = response.data.users[0];
            // Mobile phone es phone2
            const phone = user.phone2 || user.phone1 || '';
            return phone.trim() || 'No disponible';
        }
        return 'No disponible';
    } catch (error) {
        console.error("Error en getPhoneNumber:", error);
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
                params: { 
                    wstoken: token, 
                    moodlewsrestformat: 'json', 
                    wsfunction: 'core_user_get_users_by_field', 
                    field: 'id', 
                    'values[0]': numericUserId // Moodle requiere indexar los valores en arreglos
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

        // Extraemos el usuario y forzamos la lectura de phone2 y phone1
        const rawUser = userDetailsResponse.data?.[0] || {};

        return {
            userDetails: {
                ...rawUser,
                // Aseguramos que el teléfono se procese bien aquí también
                phone: rawUser.phone2 || rawUser.phone1 || 'No disponible'
            },
            userCourses: userCoursesResponse.data?.filter(c => c.id !== 1) || [],
            userBadges,
        };
    } catch (error) {
        console.error("Error en getCVData:", error);
        throw new Error("Error de conexión con Moodle");
    }
}