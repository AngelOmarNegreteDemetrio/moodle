import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from 'react-i18next';
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
import { useAuth } from '../auth/authContext';
import { useTheme } from '../context/themeContext';

const LogoSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/college-logo.png' }; 
const BackgroundSource = { uri: 'https://soluciones-hericraft.com/iniciar-sesion/pictures/fondo2.png' }; 
const FORGOT_PASSWORD_URL = "https://prueba.soluciones-hericraft.com/login/forgot_password.php"; 

export default function LoginScreen() {
    const { t } = useTranslation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { theme, isDark } = useTheme();
    const { login } = useAuth();

    const FORM_BACKGROUND = isDark ? theme.background : 'rgba(255, 255, 255, 0.9)';
    const TEXT_COLOR = theme.text;
    const INPUT_BACKGROUND = isDark ? '#333333' : '#ffffff';
    const INPUT_TEXT_COLOR = theme.text;
    const INPUT_BORDER_COLOR = isDark ? '#555' : '#ccc';
    const PRIMARY_COLOR = isDark ? theme.primary : "#E83E4C";

    useFocusEffect(
        useCallback(() => {
            return () => {
                setUsername("");
                setPassword("");
            };
        }, [])
    );

    const handleSignIn = async () => {
        if (!username || !password) {
            Alert.alert(t('common.error'), t('auth.error_empty'));
            return;
        }

        setLoading(true);

        try {
            const response = await LoginServices(username, password);
            
            if (response.success) {
                await login(response.token, response.userid, username, password);

                Toast.show({
                    type: 'custom_success', 
                    text1: t('auth.success_title'),
                    text2: t('auth.success_message'),
                    visibilityTime: 2000, 
                    position: 'top',
                    props: { 
                        isDark: isDark,
                        theme: theme
                    },
                });

                setTimeout(() => {
                    router.replace('/');
                }, 100);
            }

        } catch (error) {
            let errorMessage = t('auth.error_invalid');
            if (error.message && !error.message.includes('invalidlogin')) {
                errorMessage = error.message;
            }
            Alert.alert(t('auth.error_failed'), errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const supported = await Linking.canOpenURL(FORGOT_PASSWORD_URL);
        if (supported) {
            await Linking.openURL(FORGOT_PASSWORD_URL);
        } else {
            Alert.alert(t('common.error'), t('course_detail.error_url'));
        }
    };

    return (
        <ImageBackground 
            source={BackgroundSource} 
            style={styles.background} 
            resizeMode="cover" 
        >
            <View style={[styles.formContainer, { backgroundColor: FORM_BACKGROUND }]}>
                <View style={styles.logoContainer}> 
                    <Image source={LogoSource} style={styles.logo} resizeMode="contain" />
                </View>
                
                <Text style={[styles.title, { color: TEXT_COLOR }]}>
                    {t('auth.login_title')}
                </Text>

                <TextInput
                    style={[styles.input, { backgroundColor: INPUT_BACKGROUND, color: INPUT_TEXT_COLOR, borderColor: INPUT_BORDER_COLOR }]}
                    placeholder={t('auth.username')}
                    placeholderTextColor={isDark ? '#AAAAAA' : '#999'}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                
                <TextInput
                    style={[styles.input, { backgroundColor: INPUT_BACKGROUND, color: INPUT_TEXT_COLOR, borderColor: INPUT_BORDER_COLOR }]}
                    placeholder={t('auth.password')}
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
                        <Text style={styles.buttonText}>{t('auth.login_button')}</Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                    <Text style={[styles.forgotPasswordText, { color: PRIMARY_COLOR }]}>
                        {t('auth.forgot_password')}
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, justifyContent: "center" },
    formContainer: { paddingHorizontal: 30, paddingVertical: 50, alignItems: 'center', borderRadius: 10, marginHorizontal: 20 },
    logoContainer: { alignItems: "center", marginBottom: 30 },
    logo: { width: 280, height: 80 },
    title: { fontSize: 26, marginBottom: 30, fontWeight: "600" },
    input: { width: '100%', height: 50, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 18, fontSize: 16 },
    button: { width: '100%', marginTop: 20, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    forgotPasswordContainer: { alignItems: 'center', marginTop: 25 },
    forgotPasswordText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});