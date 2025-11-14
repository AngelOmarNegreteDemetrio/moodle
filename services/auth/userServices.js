import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// Corregido: La ruta es ../../constants/url basándose en tu estructura.
import { API_URL } from "../../constants/url"; 

/**
 * Obtiene la URL de la imagen de perfil de Moodle en la calidad más grande posible.
 * Usa la función de Moodle 'core_user_get_user_profile_image'.
 * @param {string} userId - El ID numérico del usuario en Moodle.
 * @param {string} token - El token de acceso del usuario.
 * @returns {string | null} - La URL de la imagen grande o null si no se encuentra.
 */
async function getHighQualityImageUrl(userId, token) {
    try {
        const params = new URLSearchParams({
            wstoken: token,
            wsfunction: 'core_user_get_user_profile_image', 
            moodlewsrestformat: 'json',
            'userids[0]': userId, // Usa el ID del usuario
        });

        const response = await axios.post(
            `${API_URL}webservice/rest/server.php`,
            params,
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const imageDataArray = response.data;

        if (imageDataArray && imageDataArray.profileimageurls && imageDataArray.profileimageurls.length > 0) {
            const profileImages = imageDataArray.profileimageurls[0].urls;
            
            // Buscamos la URL de la imagen más grande (size_x).
            const keys = Object.keys(profileImages);
            const largestSizeKey = keys.reduce((maxKey, currentKey) => {
                // Se asume que el tamaño está en el índice 1 después de dividir por '_'
                const currentSize = parseInt(currentKey.split('_')[1] || 0);
                const maxSize = parseInt(maxKey.split('_')[1] || 0);
                return currentSize > maxSize ? currentKey : maxKey;
            }, keys[keys.length - 1]);

            return profileImages[largestSizeKey] || profileImages['size_50']; // 'size_50' es un fallback común
        }

        return null;

    } catch (error) {
        console.error("Error al obtener URL de imagen HQ:", error.message);
        return null; // Fallback
    }
}


/**
 * Obtiene los detalles del usuario logueado usando el token y un campo de búsqueda.
 * Además de los datos estándar, busca campos personalizados para 'Grado Escolar', 'Nivel Escolar' y 'Tipo de Usuario'.
 * @param {string} value - El valor del campo a buscar (ej. 'omar.negrete').
 * @param {string} [field='username'] - El campo de Moodle por el que buscar (ej. 'username', 'email').
 * @returns {object} - El objeto con todos los datos de Moodle + los campos personalizados.
 */
export async function GetUserInfoService(value, field = 'username') {
    try {
        // 1. Recuperar el Token de Acceso guardado
        const token = await AsyncStorage.getItem("moodleToken");

        if (!token) {
            throw new Error("No se encontró el token de acceso. Por favor, inicie sesión.");
        }

        // 2. Parámetros para la llamada a la función de Moodle
        const params = new URLSearchParams({
            wstoken: token,
            wsfunction: 'core_user_get_users_by_field', 
            moodlewsrestformat: 'json',
            field: field, // Usamos el campo dinámico (por defecto 'username')
            'values[0]': value // Usamos el valor dinámico (username o email)
        });

        // 3. Realizar la llamada al servidor de Moodle.
        const response = await axios.post(
            `${API_URL}webservice/rest/server.php`,
            params,
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const userDataArray = response.data;
        
        // Moodle devuelve un arreglo, tomamos el primer usuario encontrado
        if (userDataArray && userDataArray.length > 0) {
            
            if (userDataArray.exception) {
                const errorDetail = userDataArray.message || "Error al consultar los datos de usuario en Moodle.";
                throw new Error(errorDetail);
            }

            const userData = userDataArray[0];

            // 📢 DEPURA ESTA LÍNEA PARA VER LOS NOMBRES REALES DE LOS CAMPOS PERSONALIZADOS DE MOODLE
            console.log("Campos personalizados (customfields) devueltos por Moodle:", userData.customfields);
            
            // ⭐ LOGICA PARA OBTENER LA IMAGEN HQ usando el ID del usuario ⭐
            const highQualityImageUrl = await getHighQualityImageUrl(userData.id, token);
            // ⭐ FIN LOGICA IMAGEN HQ ⭐

            // ⭐ INICIO DE LA LÓGICA DE EXTRACCIÓN DE GRADO, NIVEL Y TIPO DE USUARIO ⭐
            let userGrade = "Grado No Definido"; 
            let userLevel = ""; 
            let userType = "Tipo No Definido"; // NUEVO: Inicializamos Tipo de Usuario
            
            if (userData.customfields) {
                // NOMBRES CORTOS COMUNES Y CANDIDATOS PARA GRADO/NIVEL
                const gradeField = userData.customfields.find(field => 
                    field.shortname === 'grado_escolar' || 
                    field.name === 'Grado Escolar' || 
                    field.shortname === 'grade'
                );
                
                const levelField = userData.customfields.find(field => 
                    field.shortname === 'nivel_escolar' || 
                    field.name === 'Nivel Escolar' || 
                    field.shortname === 'level'
                );

                // NUEVA LÓGICA: Buscar 'Tipo de Usuario'
                const typeField = userData.customfields.find(field => 
                    field.shortname === 'tipo_usuario' || 
                    field.name === 'Tipo de Usuario' || 
                    field.shortname === 'usertype' ||
                    field.shortname === 'type'
                );

                if (gradeField && gradeField.value) {
                    userGrade = gradeField.value;
                }
                
                if (levelField && levelField.value) {
                    userLevel = levelField.value;
                }
                
                if (typeField && typeField.value) { // NUEVO: Asignar el valor
                    userType = typeField.value;
                }
            }
            
            // Concatenamos Grado y Nivel para la visualización principal, ejemplo: "2 Primaria"
            const fullGradeDisplay = (userGrade !== "Grado No Definido" && userLevel)
                ? `${userGrade}° ${userLevel}`
                : userGrade; // Si falta el nivel, solo mostramos el grado.

            // ⭐ FIN DE LA LÓGICA DE EXTRACCIÓN DE GRADO, NIVEL Y TIPO DE USUARIO ⭐

            // Devolvemos todos los datos de Moodle y adjuntamos los campos personalizados y la URL HQ
            return {
                ...userData,
                // Devolvemos el display completo del Grado/Nivel
                userGrade: fullGradeDisplay, 
                // NUEVO: Devolvemos el Tipo de Usuario
                userType: userType, 
                // Devolvemos los datos por separado también, por si los necesitas en el futuro
                rawGrade: userGrade,
                rawLevel: userLevel,
                profileimageurl: highQualityImageUrl || userData.profileimageurl // Usamos HQ, si falla el original.
            };
        } else {
            // Error más descriptivo
            throw new Error(`No se encontraron datos del usuario con el valor '${value}' para el campo '${field}'.`);
        }

    } catch (error) {
        console.error("Error al obtener info del usuario:", error);
        throw new Error(error.message || "Error al cargar la información del perfil. Revisa tu Token.");
    }
}