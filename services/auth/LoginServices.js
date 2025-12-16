import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../constants/url";

// ------------------------------------------------------------------
// FUNCIÓN DE CIERRE DE SESIÓN
// ------------------------------------------------------------------
export async function logoutUser() {
    await AsyncStorage.removeItem("moodleToken");
    await AsyncStorage.removeItem("moodleUserId");
    await AsyncStorage.removeItem("lastLoggedInUsername");
}
// ------------------------------------------------------------------


// ------------------------------------------------------------------
// FUNCIÓN AUXILIAR: Para obtener el ID del usuario
// ------------------------------------------------------------------
async function getUserData(token, username) {
    const functionName = "core_user_get_users_by_field";

    const userResponse = await axios.get(`${API_URL}/webservice/rest/server.php`, {
        params: {
            wstoken: token,
            moodlewsrestformat: 'json',
            wsfunction: functionName,
            field: 'username',
            values: [username]
        }
    });

    const userDataArray = userResponse.data;

    if (userDataArray && userDataArray.length > 0 && !userDataArray.exception) {
        return userDataArray[0];
    } else {
        throw new Error("No se pudo obtener el ID de usuario después de la autenticación.");
    }
}
// ------------------------------------------------------------------


export async function LoginServices(username, password) {
    try {
        // 1. OBTENER TOKEN
        const tokenResponse = await axios.post(
            `${API_URL}/login/token.php`,
            new URLSearchParams({
                username: username,
                password: password,
                service: "moodle_mobile_app"
            }),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const tokenData = tokenResponse.data;

        if (tokenData.error) {
            const errorMessage = tokenData.error
                ? `${tokenData.error} (${tokenData.errorcode || 'error de Moodle'})`
                : "Usuario o contraseña incorrectos";
            throw new Error(errorMessage);
        }

        const token = tokenData.token;

        // 2. OBTENER ID DEL USUARIO
        const userDetails = await getUserData(token, username);

        // 3. GUARDAR LA NUEVA SESIÓN
        await AsyncStorage.setItem("moodleToken", token);
        await AsyncStorage.setItem("lastLoggedInUsername", username);
        await AsyncStorage.setItem("moodleUserId", userDetails.id.toString());

        // Retornamos los datos
        return {
            token: token,
            userid: userDetails.id,
            username: username,
            success: true
        };

    } catch (error) {
        // 🚨 Eliminada la línea console.error() aquí.
        // Solo relanzamos el error para que sea capturado en la pantalla de Login.
        
        if (error.response) {
            throw new Error(`Error del servidor: ${error.response.status}. Por favor, verifica tu URL o credenciales.`);
        } else if (error.request) {
            throw new Error("No se pudo conectar al servidor Moodle. Verifica tu conexión a internet.");
        } else {
            throw new Error(error.message || "Error desconocido durante el inicio de sesión.");
        }
    }
}