import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LoginServices } from "../services/auth/LoginServices";

/* --- FUENTES DE IMAGEN --- */
const LogoSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/college-logo.png' }; 
const BackgroundSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/fondo2.png' }; 
/* --- FIN FUENTES DE IMAGEN --- */

/* Definición de Colores de College */
const COLLEGE_COLORS = {
  BUTTON_COLOR: '#E83E4C', 
  LINK_COLOR: '#007AFF', 
  TEXT_DARK: '#333333', 
  TEXT_LIGHT: '#999999', 
  BORDER_LIGHT: '#E0E0E0', 
  WHITE: '#FFFFFF',
  /* Eliminamos FORM_BACKGROUND_OVERLAY */
};

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* --- TUS FUNCIONES ORIGINALES (NO MODIFICADAS) --- */
  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const authData = await LoginServices(username, password);
      Alert.alert("✅ Login exitoso", `Bienvenido ${username}`);
      
      router.push("/(tabs)/homeScreen");
      
    } catch (error) {
      Alert.alert("Error de login", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = () => {
    Alert.alert("Enlace", "Navegar a 'Olvidé mi contraseña'");
  };
  /* --- FIN FUNCIONES ORIGINALES --- */

  return (
    <ImageBackground 
      source={BackgroundSource} 
      style={styles.background} 
      resizeMode="cover" 
    >
      {/* 2. Contenedor del formulario. Ahora sin fondo, margen ni sombras */}
      <View style={styles.formContainer}>
        
        {/* 3. Logo de College desde URL */}
        <View style={styles.logoContainer}> 
          <Image 
            source={LogoSource} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>
        
        <Text style={styles.title}>Iniciar Sesión</Text>

        {/* 4. Inputs de Usuario y Contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor={COLLEGE_COLORS.TEXT_LIGHT}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={COLLEGE_COLORS.TEXT_LIGHT}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* 5. Botón de Iniciar Sesión */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLLEGE_COLORS.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Acceder</Text>
          )}
        </TouchableOpacity>
        
        {/* 6. Enlace Olvidé mi Contraseña */}
        <TouchableOpacity 
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Olvidé mi contraseña</Text>
        </TouchableOpacity>
        
      </View>
    </ImageBackground>
  );
}

/* --- SECCIÓN DE ESTILOS --- */
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: "center", 
  },

  formContainer: {
    /* Eliminamos: backgroundColor, marginHorizontal, borderRadius, shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation */
    paddingHorizontal: 30, // Mantenemos el padding para el espaciado
    paddingVertical: 50, // Mantenemos el padding vertical
    alignItems: 'center', 
  },
  
  logoContainer: { 
    alignItems: "center",
    marginBottom: 50, 
  },

  logo: { 
    width: 280, 
    height: 80, 
  },
  
  title: {
    fontSize: 26, 
    marginBottom: 35,
    textAlign: "center",
    fontWeight: "600",
    color: COLLEGE_COLORS.TEXT_DARK, 
  },
  
  input: {
    width: '100%', 
    height: 50,
    borderWidth: 1,
    borderColor: COLLEGE_COLORS.BORDER_LIGHT, 
    borderRadius: 8,
    padding: 12,
    marginBottom: 18, 
    fontSize: 16,
    color: COLLEGE_COLORS.TEXT_DARK,
    backgroundColor: COLLEGE_COLORS.WHITE, 
  },
  
  button: {
    width: '100%',
    marginTop: 20,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLLEGE_COLORS.BUTTON_COLOR, 
    shadowColor: COLLEGE_COLORS.BUTTON_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, 
  },
  
  buttonText: {
    color: COLLEGE_COLORS.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
  
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 25, 
  },
  
  forgotPasswordText: {
    color: COLLEGE_COLORS.LINK_COLOR, 
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});