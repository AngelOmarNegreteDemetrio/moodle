import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../constants/url";

// ---------------------------------------------------------------------------------
// 🛑 ELIMINADA: La función getCourseProgress ha sido eliminada por completo 
// para evitar llamadas repetidas a la API (core_completion_get_course_completion_status).
// ---------------------------------------------------------------------------------


// --- FUNCIÓN PRINCIPAL: OBTENER CURSOS MATRICULADOS (SIN PROGRESO) ---
export const getEnrolledCourses = async () => {
    try {
        const token = await AsyncStorage.getItem("moodleToken");
        const userId = await AsyncStorage.getItem("moodleUserId"); 
        
        if (!token || !userId) {
            throw new Error("Token o ID de usuario no encontrados. Sesión inválida.");
        }

        const moodleUrl = `${API_URL}webservice/rest/server.php`;
        
        // 1. OBTENER SOLO LA LISTA BÁSICA DE CURSOS (core_enrol_get_users_courses)
        const listParams = new URLSearchParams({
            wstoken: token,
            wsfunction: 'core_enrol_get_users_courses',
            moodlewsrestformat: 'json',
            userid: userId,
        });

        const listResponse = await fetch(`${moodleUrl}?${listParams.toString()}`);
        const coursesList = await listResponse.json();

        if (coursesList.exception) {
            console.error("Moodle API Error (List):", coursesList);
            throw new Error(coursesList.message || "Error al obtener la lista de cursos.");
        }
        
        // 2. 🛑 ELIMINADA: La lógica de Promise.all y .map para obtener el progreso. 
        // Solo retornamos la lista de cursos básica.
        const finalCourses = coursesList.map(course => ({
            // Mapeamos los campos que usas en la vista (CourseScreen.js)
            id: course.id, // Usamos 'id' en lugar de 'idMoodle' para consistencia con Moodle
            fullname: course.fullname, // Usamos 'fullname' en lugar de 'nombre'
            // Opcionalmente, puedes dejar 'progress' en 0 o null si tu vista lo necesita, 
            // pero ya eliminamos el campo del renderizado en course.js.
        }));

        return finalCourses; 

    } catch (error) {
        console.error("Error en getEnrolledCourses:", error);
        throw error;
    }
};

// ---------------------------------------------------------------------
// --- FUNCIÓN: OBTENER ACTIVIDADES PENDIENTES DEL CURSO (SIN CAMBIOS) ---
// ---------------------------------------------------------------------

/**
 * Obtiene el contenido del curso y filtra las actividades que faltan por realizar.
 * Utiliza la función core_course_get_contents.
 * @param {number} courseId - El ID del curso de Moodle.
 */
export async function GetCourseActivitiesService(courseId) {
    try {
        const token = await AsyncStorage.getItem("moodleToken");
        if (!token) throw new Error("Token de sesión no encontrado.");

        const moodleUrl = `${API_URL}webservice/rest/server.php`;

        const params = new URLSearchParams({
            wstoken: token,
            wsfunction: "core_course_get_contents", // <-- Función clave
            moodlewsrestformat: "json",
            courseid: courseId, 
        });

        // Usamos axios.post 
        const response = await axios.post(
            moodleUrl,
            params,
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const courseContents = response.data;
        const pendingActivities = [];

        // Iterar sobre las secciones y sus módulos (actividades)
        for (const section of courseContents) {
            if (section.modules) {
                for (const module of section.modules) {
                    if (module.completion) {
                        const isPending = module.completiondata?.state === 0;
                        
                        if (isPending) {
                            pendingActivities.push({
                                id: module.id,
                                name: module.name,
                                type: module.modname, // Ej: 'assign' (tarea), 'quiz' (examen)
                                sectionName: section.name,
                                url: module.url,
                            });
                        }
                    }
                }
            }
        }

        return pendingActivities; // Retorna solo la lista de pendientes

    } catch (error) {
        console.error("Error al obtener actividades del curso:", error.message);
        throw new Error("No se pudo cargar la lista de actividades pendientes.");
    }
}