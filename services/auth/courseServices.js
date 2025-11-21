import AsyncStorage from "@react-native-async-storage/async-storage";
// ✅ La ruta a tu archivo de constantes es "../../constants/url"
import { API_URL } from "../../constants/url"; 

export const getEnrolledCourses = async () => {
    try {
        // 1. RECUPERAR DATOS DE SESIÓN: TOKEN Y USERID
        const token = await AsyncStorage.getItem("moodleToken");
        // 🛑 CLAVE: Obtener el ID que se guardó en el Login
        const userId = await AsyncStorage.getItem("moodleUserId"); 
        
        if (!token || !userId) {
            throw new Error("Token o ID de usuario no encontrados. Sesión inválida.");
        }

        const moodleUrl = `${API_URL}/webservice/rest/server.php`;
        
        // 2. CONSTRUIR LA PETICIÓN USANDO EL USERID
        const params = new URLSearchParams({
            wstoken: token,
            wsfunction: 'core_enrol_get_users_courses',
            moodlewsrestformat: 'json',
            userid: userId, // ✅ Esto hace que la API busque los cursos de ESE usuario
        });

        // Esto te ayuda a debuggear: revisa que el UserID sea diferente para cada usuario.
        console.log(`[DEBUG] Buscando cursos para UserID: ${userId}`); 

        const response = await fetch(`${moodleUrl}?${params.toString()}`);
        const data = await response.json();

        if (data.exception) {
            console.error("Moodle API Error:", data);
            throw new Error(data.message || "Error al obtener la lista de cursos de Moodle.");
        }

        return data;
    } catch (error) {
        console.error("Error en getEnrolledCourses:", error);
        throw error;
    }
};