// app/auth/Login.js

import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ImageBackground,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from 'react-native-toast-message';


import { LoginServices } from "../../services/auth/LoginServices";
import { useTheme } from '../context/themeContext';

const LogoSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/college-logo.png' }; 
const BackgroundSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/fondo2.png' }; 

// 🚨 URL ESPECÍFICA PARA LA RECUPERACIÓN DE CONTRASEÑA
const FORGOT_PASSWORD_URL = "https://prueba.soluciones-hericraft.com/login/forgot_password.php"; 


export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { theme, isDark } = useTheme();

    const FORM_BACKGROUND = isDark ? theme.background : 'rgba(255, 255, 255, 0.9)';
    const TEXT_COLOR = theme.text;
    const INPUT_BACKGROUND = isDark ? '#333333' : '#ffffff';
    const INPUT_TEXT_COLOR = theme.text;
    const INPUT_BORDER_COLOR = isDark ? '#555' : '#ccc';
    const PRIMARY_COLOR = isDark ? theme.primary : "#E83E4C";

    // Efecto para limpiar los campos cada vez que la pantalla se enfoca
    useFocusEffect(
        useCallback(() => {
            setUsername("");
            setPassword("");
            return () => {};
        }, [])
    );


    const handleSignIn = async () => {
        if (!username || !password) {
            Alert.alert("Error", "Por favor ingresa tu usuario y contraseña.");
            return;
        }

        setLoading(true);

        try {
            await LoginServices(username, password);
            
            Toast.show({
                type: 'custom_success', 
                text1: `¡Acceso Exitoso!`,
                text2: `Bienvenido, ${username}.`,
                visibilityTime: 2500, 
                position: 'top',
                props: { 
                    isDark: isDark,
                    theme: theme
                },
            });
            
            setTimeout(() => {
                router.push("/");
            }, 100); 

        } catch (error) {
            
            // MANEJO DE ERROR
            let errorMessage = "Ocurrió un error inesperado al intentar iniciar sesión.";

            if (error.message && error.message.includes('invalidlogin')) {
                errorMessage = "Usuario o contraseña incorrectos.";
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }

            Alert.alert("Inicio de Sesión Fallido", errorMessage);

        } finally {
            setLoading(false);
        }
    };

    // 🚨 FUNCIÓN MEJORADA: Abrir enlace de recuperación en el navegador
    const handleForgotPassword = async () => {
        
        const supported = await Linking.canOpenURL(FORGOT_PASSWORD_URL);

        if (supported) {
            // Abre la URL en el navegador web del dispositivo
            await Linking.openURL(FORGOT_PASSWORD_URL);
        } else {
            Alert.alert(
                "Error de Navegación", 
                `No se puede abrir la URL: ${FORGOT_PASSWORD_URL}. Por favor contacte soporte.`
            );
        }
    };

    return (
        <ImageBackground 
            source={BackgroundSource} 
            style={styles.background} 
            resizeMode="cover" 
        >
            <View style={[
                styles.formContainer,
                { backgroundColor: FORM_BACKGROUND }
            ]}>
                <View style={styles.logoContainer}> 
                    <Image 
                        source={LogoSource} 
                        style={styles.logo} 
                        resizeMode="contain" 
                    />
                </View>
                
                <Text style={[styles.title, { color: TEXT_COLOR }]}>Iniciar Sesión</Text>

                <TextInput
                    style={[
                        styles.input,
                        { 
                            backgroundColor: INPUT_BACKGROUND, 
                            color: INPUT_TEXT_COLOR,
                            borderColor: INPUT_BORDER_COLOR
                        }
                    ]}
                    placeholder="Usuario"
                    placeholderTextColor={isDark ? '#AAAAAA' : '#999'}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                
                <TextInput
                    style={[
                        styles.input,
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
                    style={[styles.button, { backgroundColor: PRIMARY_COLOR }]}
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
                    onPress={handleForgotPassword} // 🚨 Llama a la nueva función de Linking
                    style={styles.forgotPasswordContainer}
                >
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
        marginHorizontal: 20, 
    },
    
    logoContainer: { 
        alignItems: "center",
        marginBottom: 30, 
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
    },
    
    input: {
        width: '100%', 
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 18, 
        fontSize: 16,
    },
    
    button: {
        width: '100%',
        marginTop: 20,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
});