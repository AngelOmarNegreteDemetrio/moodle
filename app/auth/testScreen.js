import {
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';

// URL del Test (la que nos proporcionaste)
const TEST_URL = "https://education.soluciones-hericraft.com/user/test-roles/test-liderazgo.html"; 

// 🚨 CORRECCIÓN: Nombre del componente con mayúscula inicial para coincidir con la ruta
export default function TestScreen() { 

    return (
        // Usamos SafeAreaView para manejar la barra de estado y la muesca (notch)
        <SafeAreaView style={styles.container}>
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
        // Opcional: define un color de fondo si el WebView no cubre toda la pantalla.
        backgroundColor: '#FFFFFF', 
    },
    webView: {
        flex: 1,
    }
});