import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

import { LoginServices } from "../../services/auth/LoginServices";
// 🚨 Importar useTheme para acceder al contexto del tema
import { useTheme } from '../context/themeContext';

const LogoSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/college-logo.png' }; 
const BackgroundSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/fondo2.png' }; 

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // 🚨 OBTENER EL TEMA
    const { theme, isDark } = useTheme();

    // 🚨 DEFINICIÓN DINÁMICA DE COLORES
    const FORM_BACKGROUND = isDark ? theme.background : 'rgba(255, 255, 255, 0.9)'; // Fondo del formulario semitransparente o sólido
    const TEXT_COLOR = theme.text; // Color del título y texto general
    const INPUT_BACKGROUND = isDark ? '#333333' : '#ffffff'; // Fondo de los campos de texto
    const INPUT_TEXT_COLOR = theme.text; // Color del texto del input
    const INPUT_BORDER_COLOR = isDark ? '#555' : '#ccc'; // Color del borde del input
    const PRIMARY_COLOR = isDark ? theme.primary : "#E83E4C"; // Color del botón y enlaces

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

    /* * MANEJO DE IMAGEN DE FONDO
     * La imagen de fondo se mantiene para ambos modos, pero el color del texto y la caja de login cambian.
     * Si deseas una imagen de fondo diferente para el modo oscuro, necesitarías definirla aquí.
     */
    return (
        <ImageBackground 
            source={BackgroundSource} 
            style={styles.background} 
            resizeMode="cover" 
        >
            <View style={[
                styles.formContainer,
                // Aplicamos un fondo al formContainer para que el texto sea legible
                { backgroundColor: FORM_BACKGROUND }
            ]}>
                <View style={styles.logoContainer}> 
                    <Image 
                        source={LogoSource} 
                        style={styles.logo} 
                        resizeMode="contain" 
                    />
                </View>
                
                {/* 🚨 Aplicamos color dinámico al título */}
                <Text style={[styles.title, { color: TEXT_COLOR }]}>Iniciar Sesión</Text>

                <TextInput
                    style={[
                        styles.input,
                        // 🚨 Aplicamos estilos dinámicos al input
                        { 
                            backgroundColor: INPUT_BACKGROUND, 
                            color: INPUT_TEXT_COLOR,
                            borderColor: INPUT_BORDER_COLOR
                        }
                    ]}
                    placeholder="Usuario"
                    placeholderTextColor={isDark ? '#AAAAAA' : '#999'} // Placeholder oscuro/claro
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                
                <TextInput
                    style={[
                        styles.input,
                        // 🚨 Aplicamos estilos dinámicos al input
                        { 
                            backgroundColor: INPUT_BACKGROUND, 
                            color: INPUT_TEXT_COLOR,
                            borderColor: INPUT_BORDER_COLOR
                        }
                    ]}
                    placeholder="Contraseña"
                    placeholderTextColor={isDark ? '#AAAAAA' : '#999'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: PRIMARY_COLOR }]} // 🚨 Color de botón dinámico
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
                    {/* 🚨 Color de enlace dinámico */}
                    <Text style={[styles.forgotPasswordText, { color: PRIMARY_COLOR }]}>Olvidé mi contraseña</Text>
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
        borderRadius: 10,
        marginHorizontal: 20, // Añadido para darle espacio lateral y centrar la caja
    },
    
    logoContainer: { 
        alignItems: "center",
        marginBottom: 30, // Reducido un poco para centrar mejor
    },

    logo: { 
        width: 280, 
        height: 80, 
    },
    
    title: {
        fontSize: 26, 
        marginBottom: 30,
        textAlign: "center",
        fontWeight: "600",
        // Color se aplica dinámicamente
    },
    
    input: {
        width: '100%', 
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 18, 
        fontSize: 16,
        // Colores aplicados dinámicamente
    },
    
    button: {
        width: '100%',
        marginTop: 20,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        // Color de fondo dinámico
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
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
        // Color aplicado dinámicamente
    },
});