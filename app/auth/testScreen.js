import {
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';

// 🚨 Importar useTheme para acceder al contexto del tema
import { useTheme } from '../context/themeContext';

// URL del Test (la que nos proporcionaste)
const TEST_URL = "https://education.soluciones-hericraft.com/user/test-roles/test-liderazgo.html"; 

export default function TestScreen() { 
    // 🚨 OBTENER EL TEMA: Usamos el hook para obtener el objeto 'theme'
    const { theme } = useTheme();

    // El color de fondo del contenedor debe ser el color de fondo del tema
    const containerBackgroundColor = theme.background; 

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
            <WebView 
                source={{ uri: TEST_URL }} 
                style={styles.webView} 
                // Props recomendadas para cargar contenido web externo de forma robusta
                sharedCookiesEnabled={true}
                thirdPartyCookiesEnabled={true}
                javaScriptEnabled={true} 
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Eliminamos el color fijo de aquí, ahora lo aplicamos dinámicamente arriba
    },
    webView: {
        flex: 1,
    }
});