import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

import { LoginServices } from "../../services/auth/LoginServices";

const LogoSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/college-logo.png' }; 
const BackgroundSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/fondo2.png' }; 

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);

    try {
      await LoginServices(username, password);
      Alert.alert("✅ Login exitoso", `Bienvenido ${username}`);
      router.push("/");
    } catch (error) {
      Alert.alert("Error de login", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Enlace", "Navegar a 'Olvidé mi contraseña'");
  };

  return (
    <ImageBackground 
      source={BackgroundSource} 
      style={styles.background} 
      resizeMode="cover" 
    >
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}> 
          <Image 
            source={LogoSource} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>
        
        <Text style={styles.title}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Acceder</Text>
          )}
        </TouchableOpacity>
        
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: "center", 
  },

  formContainer: {
    paddingHorizontal: 30,
    paddingVertical: 50,
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
    color: "#222", 
  },
  
  input: {
    width: '100%', 
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc", 
    borderRadius: 8,
    padding: 12,
    marginBottom: 18, 
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fff", 
  },
  
  button: {
    width: '100%',
    marginTop: 20,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#E83E4C",
    shadowColor: "#E83E4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, 
  },
  
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 25, 
  },
  
  forgotPasswordText: {
    color: "#E83E4C", // link rojo para combinar con el botón
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
