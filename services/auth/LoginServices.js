import axios from "axios";
import { API_URL } from "../../constants/url";

async function getUserData(token, username) {
    const functionName = "core_user_get_users_by_field";

    const userResponse = await axios.get(`${API_URL}/webservice/rest/server.php`, {
        params: {
            wstoken: token,
            moodlewsrestformat: 'json',
            wsfunction: functionName,
            field: 'username',
            'values[0]': username 
        }
    });

    const userDataArray = userResponse.data;

    if (Array.isArray(userDataArray) && userDataArray.length > 0) {
        return userDataArray[0];
    } 
    
    if (userDataArray.exception) {
        throw new Error(userDataArray.message);
    }

    throw new Error("USER_NOT_FOUND");
}

export async function LoginServices(username, password) {
    try {
        const tokenResponse = await axios.post(
            `${API_URL}/login/token.php`,
            new URLSearchParams({
                username: username,
                password: password,
                service: "moodle_mobile_app"
            }).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const tokenData = tokenResponse.data;

        if (tokenData.error) {
            throw new Error(tokenData.error);
        }

        const token = tokenData.token;
        const userDetails = await getUserData(token, username);

        return {
            token: token,
            userid: String(userDetails.id),
            username: username,
            password: password,
            success: true
        };

    } catch (error) {
        let cleanMessage = "Ocurrió un error al conectar con el servidor.";

        const errorStr = String(error.message).toLowerCase();

        if (errorStr.includes("invalid login") || errorStr.includes("invalidlogin")) {
            cleanMessage = "Usuario o contraseña incorrectos. Por favor, verifica tus datos.";
        } else if (errorStr.includes("user_not_found")) {
            cleanMessage = "El usuario no existe o no tiene permisos en esta plataforma.";
        } else if (errorStr.includes("network error")) {
            cleanMessage = "No hay conexión a internet.";
        }

        throw new Error(cleanMessage);
    }
}