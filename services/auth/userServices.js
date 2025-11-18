import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../constants/url";

/**
 * Obtiene la URL de la imagen de perfil de Moodle en la calidad más grande posible.
 */
async function getHighQualityImageUrl(userId, token) {
    try {
        const params = new URLSearchParams({
            wstoken: token,
            wsfunction: "core_user_get_user_profile_image",
            moodlewsrestformat: "json",
            "userids[0]": userId,
        });

        const response = await axios.post(
            `${API_URL}webservice/rest/server.php`,
            params,
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const imageDataArray = response.data;

        if (
            imageDataArray &&
            imageDataArray.profileimageurls &&
            imageDataArray.profileimageurls.length > 0
        ) {
            const profileImages =
                imageDataArray.profileimageurls[0].urls;

            // Obtener la clave de mayor tamaño
            const keys = Object.keys(profileImages);
            const largestSizeKey = keys.reduce((maxKey, currentKey) => {
                const currentSize = parseInt(currentKey.split("_")[1] || 0);
                const maxSize = parseInt(maxKey.split("_")[1] || 0);
                return currentSize > maxSize ? currentKey : maxKey;
            }, keys[0]);

            let finalUrl =
                profileImages[largestSizeKey] || profileImages["size_50"];

            // 🔥 Forzar Moodle a enviar imagen original y evitar caché
            finalUrl += `&rev=${Date.now()}`;

            return finalUrl;
        }

        return null;
    } catch (error) {
        console.error("Error al obtener URL de imagen HQ:", error.message);
        return null;
    }
}

/**
 * Obtiene información del usuario incluyendo imagen HQ y campos personalizados.
 */
export async function GetUserInfoService(value, field = "username") {
    try {
        const token = await AsyncStorage.getItem("moodleToken");

        if (!token) {
            throw new Error("No se encontró el token de acceso.");
        }

        const params = new URLSearchParams({
            wstoken: token,
            wsfunction: "core_user_get_users_by_field",
            moodlewsrestformat: "json",
            field: field,
            "values[0]": value,
        });

        const response = await axios.post(
            `${API_URL}webservice/rest/server.php`,
            params,
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const userDataArray = response.data;

        if (userDataArray && userDataArray.length > 0) {
            const userData = userDataArray[0];

            const highQualityImageUrl = await getHighQualityImageUrl(
                userData.id,
                token
            );

            let userGrade = "Grado No Definido";
            let userLevel = "";
            let userType = "Tipo No Definido";

            if (userData.customfields) {
                const gradeField = userData.customfields.find(
                    (field) =>
                        field.shortname === "grado_escolar" ||
                        field.name === "Grado Escolar" ||
                        field.shortname === "grade"
                );

                const levelField = userData.customfields.find(
                    (field) =>
                        field.shortname === "nivel_escolar" ||
                        field.name === "Nivel Escolar" ||
                        field.shortname === "level"
                );

                const typeField = userData.customfields.find(
                    (field) =>
                        field.shortname === "tipo_usuario" ||
                        field.name === "Tipo de Usuario" ||
                        field.shortname === "usertype" ||
                        field.shortname === "type"
                );

                if (gradeField?.value) userGrade = gradeField.value;
                if (levelField?.value) userLevel = levelField.value;
                if (typeField?.value) userType = typeField.value;
            }

            const fullGradeDisplay =
                userGrade !== "Grado No Definido" && userLevel
                    ? `${userGrade}° ${userLevel}`
                    : userGrade;

            return {
                ...userData,
                userGrade: fullGradeDisplay,
                userType: userType,
                rawGrade: userGrade,
                rawLevel: userLevel,

                // 🔥 Imagen realmente en alta calidad
                profileimageurl:
                    highQualityImageUrl || userData.profileimageurl,
            };
        } else {
            throw new Error(
                `No se encontraron datos del usuario '${value}'.`
            );
        }
    } catch (error) {
        console.error("Error al obtener info del usuario:", error);
        throw new Error(
            error.message ||
                "Error al cargar la información del perfil. Revisa tu Token."
        );
    }
}
