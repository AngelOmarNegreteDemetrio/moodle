import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../constants/url";

async function getHighQualityImageUrl(userId, token) {
    try {
        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: "core_user_get_user_profile_image",
                moodlewsrestformat: "json",
                "userids[0]": userId,
            }
        });

        const imageDataArray = response.data;

        if (imageDataArray && imageDataArray.profileimageurls && imageDataArray.profileimageurls.length > 0) {
            const profileImages = imageDataArray.profileimageurls[0].urls;
            const keys = Object.keys(profileImages);
            const largestSizeKey = keys.reduce((maxKey, currentKey) => {
                const currentSize = parseInt(currentKey.split("_")[1] || 0);
                const maxSize = parseInt(maxKey.split("_")[1] || 0);
                return currentSize > maxSize ? currentKey : maxKey;
            }, keys[0]);

            let finalUrl = profileImages[largestSizeKey] || profileImages["size_50"];
            finalUrl += `&rev=${Date.now()}`;
            return finalUrl;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function GetUserInfoService(value, field = "username") {
    try {
        const token = await AsyncStorage.getItem("moodleToken");

        if (!token) {
            throw new Error("No se encontró el token de acceso.");
        }

        const response = await axios.get(`${API_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: token,
                wsfunction: "core_user_get_users_by_field",
                moodlewsrestformat: "json",
                field: field,
                "values[0]": String(value).trim(),
            }
        });

        let userDataArray = response.data;

        if ((!userDataArray || userDataArray.length === 0) && field === "username") {
            const retryResponse = await axios.get(`${API_URL}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: "core_user_get_users_by_field",
                    moodlewsrestformat: "json",
                    field: "idnumber",
                    "values[0]": String(value).trim(),
                }
            });
            userDataArray = retryResponse.data;
        }

        if (userDataArray && userDataArray.length > 0) {
            const userData = userDataArray[0];

            const highQualityImageUrl = await getHighQualityImageUrl(userData.id, token);

            let userGrade = "Grado No Definido";
            let userLevel = "";
            let userType = "Tipo No Definido";

            if (userData.customfields) {
                const gradeField = userData.customfields.find((f) =>
                    f.shortname === "grado_escolar" || f.name === "Grado Escolar" || f.shortname === "grade"
                );

                const levelField = userData.customfields.find((f) =>
                    f.shortname === "nivel_escolar" || f.name === "Nivel Escolar" || f.shortname === "level"
                );

                const typeField = userData.customfields.find((f) =>
                    f.shortname === "tipo_usuario" || f.name === "Tipo de Usuario" || f.shortname === "usertype" || f.shortname === "type"
                );

                if (gradeField?.value) userGrade = gradeField.value;
                if (levelField?.value) userLevel = levelField.value;
                if (typeField?.value) userType = typeField.value;
            }

            const fullGradeDisplay = userGrade !== "Grado No Definido" && userLevel
                ? `${userGrade}° ${userLevel}`
                : userGrade;

            return {
                ...userData,
                userGrade: fullGradeDisplay,
                userType: userType,
                rawGrade: userGrade,
                rawLevel: userLevel,
                profileimageurl: highQualityImageUrl || userData.profileimageurl,
            };
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}