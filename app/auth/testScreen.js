import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/themeContext';

const TEST_URL = "https://education.soluciones-hericraft.com/user/test-roles/test-liderazgo.html"; 

export default function TestScreen() { 
    const { theme } = useTheme();
    const { i18n } = useTranslation();
    const currentLang = i18n.language || 'es';

    const translateScript = `
      (function() {
        if ('${currentLang}' === 'en') {
          function translate() {
            const replacements = {
              'Test de Liderazgo': 'Leadership Test',
              'Enviar': 'Submit',
              'Pregunta': 'Question',
              'Nombre': 'Name',
              'Siguiente': 'Next',
              'Anterior': 'Previous',
              'Selecciona': 'Select'
            };

            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walk.nextNode()) {
              for (const [key, value] of Object.entries(replacements)) {
                if (node.nodeValue.includes(key)) {
                  node.nodeValue = node.nodeValue.replace(key, value);
                }
              }
            }

            document.querySelectorAll('input, button').forEach(el => {
              for (const [key, value] of Object.entries(replacements)) {
                if (el.value === key) el.value = value;
                if (el.placeholder === key) el.placeholder = value;
                if (el.innerText === key) el.innerText = value;
              }
            });
          }

          translate();
          
          const observer = new MutationObserver(translate);
          observer.observe(document.body, { childList: true, subtree: true });
        }
      })();
      true;
    `;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <WebView 
                source={{ uri: `${TEST_URL}?lang=${currentLang}` }} 
                style={styles.webView} 
                injectedJavaScript={translateScript}
                javaScriptEnabled={true} 
                domStorageEnabled={true}
                onMessage={(event) => {}}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1 
    },
    webView: { 
        flex: 1 
    }
});