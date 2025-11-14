import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MOODLE_URL = "https://prueba.soluciones-hericraft.com";

export async function LoginServices(username, password) {
    try {
        //  token basico de moodle
        const tokenResponse = await axios.post(
            `${MOODLE_URL}/login/token.php`,
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
        console.log("Token response:", tokenData);

        if (tokenData.error) {
            // Verificar si Moodle devuelve un mensaje de error específico
            const errorMessage = tokenData.error 
                ? `${tokenData.error} (${tokenData.errorcode || 'error de Moodle'})`
                : "Usuario o contraseña incorrectos";
            throw new Error(errorMessage);
        }

        const token = tokenData.token;

        if (!token) {
            throw new Error("No se pudo obtener el token de acceso");
        }

        // Guardado del token y el username
        await AsyncStorage.setItem("moodleToken", token);
        await AsyncStorage.setItem("lastLoggedInUsername", username); // <-- AÑADIDO ESTO

        // Retornamos los datos
        return {
            token: token,
            username: username,
            success: true
        };

    } catch (error) {
        console.error("Error en login Moodle:", error);
        if (error.response) {
            throw new Error(`Error del servidor: ${error.response.status}. Por favor, verifica tu URL o credenciales.`);
        } else if (error.request) {
            throw new Error("No se pudo conectar al servidor Moodle. Verifica tu conexión a internet.");
        } else if (error.message && !error.message.includes('Moodle')) {
            throw error; 
        } else {
            throw new Error(error.message || "Error desconocido durante el inicio de sesión.");
        }
    }
}