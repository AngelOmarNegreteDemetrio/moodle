import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from "../../constants/url";

// 🚨 FUNCIÓN PRINCIPAL QUE USA core_user_get_users_by_field (LA QUE SÍ JALA) 🚨
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

// 🔑 NUEVA FUNCIÓN PARA OBTENER SÓLO EL TELÉFONO USANDO core_user_get_users 🔑
export async function getPhoneNumber(userId) {
    const token = await AsyncStorage.getItem("moodleToken");
    
    if (!token || !userId) {
        return 'No disponible';
    }

    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                moodlewsrestformat: 'json',
                wsfunction: 'core_user_get_users', // <--- La función que necesita el permiso extra
                criteria: [
                    {
                        key: 'id',
                        value: userId.toString()
                    }
                ],
            }
        });

        if (response.data && response.data.users && response.data.users.length > 0) {
            const user = response.data.users[0];
            const phone = user.phone || user.mobile || user.phone1 || user.phone2 || '';
            const cleanedPhone = phone.trim().replace(/\s+/g, ''); 
            
            if (cleanedPhone) {
                return cleanedPhone;
            }
        }
        
        return 'No disponible';
        
    } catch (error) {
        // Si hay un error de acceso/permisos, devolvemos un valor seguro
        console.warn("Fallo al obtener teléfono con core_user_get_users (posiblemente por permisos).", error.message);
        return 'No disponible';
    }
}

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
        console.warn("La función core_enrol_get_users_courses no está habilitada o falló. Los cursos no se mostrarán.");
        return [];
    }
}

export async function getCVData() {
    const token = await AsyncStorage.getItem("moodleToken");
    const userId = await AsyncStorage.getItem("moodleUserId");
    
    if (!token || !userId) {
        throw new Error("Sesión no activa. Por favor, inicie sesión.");
    }

    const numericUserId = parseInt(userId);

    try {
        const [userDetails, userCourses] = await Promise.all([
            fetchUserDetails(token, numericUserId),
            fetchUserCourses(token, numericUserId),
        ]);

        return {
            userDetails,
            userCourses,
        };
    } catch (error) {
        throw new Error(`Fallo al obtener datos de Moodle para el CV: ${error.message}`);
    }
}