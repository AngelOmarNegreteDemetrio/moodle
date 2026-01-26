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
            values: [username]
        }
    });

    const userDataArray = userResponse.data;

    if (userDataArray && userDataArray.length > 0 && !userDataArray.exception) {
        return userDataArray[0];
    } else {
        throw new Error("No se pudo obtener el ID de usuario.");
    }
}

export async function LoginServices(username, password) {
    try {
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
            throw new Error(tokenData.error);
        }

        const token = tokenData.token;
        const userDetails = await getUserData(token, username);

        return {
            token: token,
            userid: userDetails.id,
            username: username,
            password: password,
            success: true
        };

    } catch (error) {
        throw new Error(error.message || "Error en el login");
    }
}