import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MOODLE_URL = "https://prueba.soluciones-hericraft.com";

export async function LoginServices(username, password) {
  try {
    // Solicitar token básico sin especificar servicio web
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
      throw new Error(tokenData.error || "Usuario o contraseña incorrectos");
    }

    const token = tokenData.token;

    if (!token) {
      throw new Error("No se pudo obtener el token de acceso");
    }

    // Guardamos el token en AsyncStorage
    await AsyncStorage.setItem("moodleToken", token);

    // Retornamos solo lo necesario
    return {
      token: token,
      username: username,
      success: true
    };

  } catch (error) {
    console.error("Error en login Moodle:", error);
    
    if (error.response) {
      throw new Error(`Error del servidor: ${error.response.status}`);
    } else if (error.request) {
      throw new Error("No se pudo conectar al servidor Moodle");
    } else {
      throw error;
    }
  }
}