import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/themeContext';

export default function WorkDetailScreen() {
    const router = useRouter();
    const { url, courseId, courseName } = useLocalSearchParams();
    const { isDark } = useTheme();
    const [credentials, setCredentials] = useState({ user: '', pass: '' });
    const [isVisible, setIsVisible] = useState(false);
    const webViewRef = useRef(null);

    const PRIMARY_COLOR = isDark ? '#F55D69' : '#FF0000';

    useEffect(() => {
        const getCreds = async () => {
            try {
                const user = await SecureStore.getItemAsync("lastLoggedInUsername");
                const pass = await SecureStore.getItemAsync("lastLoggedInPassword");
                if (user && pass) setCredentials({ user, pass });
            } catch (error) {
                console.error("Error leyendo SecureStore:", error);
            }
        };
        getCreds();
    }, []);

    const cssToInject = `
        nav.navbar, 
        .fixed-top, 
        #nav-drawer, 
        .secondary-navigation,
        .tertiary-navigation,
        footer#page-footer,
        .footer-content-popover,
        .tool_usertours-resettour,
        .breadcrumb,
        #page-footer {
            display: none !important;
        }

        body {
            margin-top: 0 !important;
            padding-top: 0 !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
        }

        #page {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
        }

        ::-webkit-scrollbar { 
            display: none !important; 
        }

        html, body {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
    `;

    const loginJS = `
        (function() {
            var checkExist = setInterval(function() {
                var userField = document.getElementById('username') || document.getElementsByName('username')[0];
                var passField = document.getElementById('password') || document.getElementsByName('password')[0];
                var loginBtn = document.getElementById('loginbtn') || document.querySelector('button[type="submit"]');
                
                if (userField && passField && loginBtn) {
                    userField.value = '${credentials.user}';
                    passField.value = '${credentials.pass}';
                    loginBtn.click();
                    clearInterval(checkExist);
                }
            }, 100);

            setTimeout(function() { clearInterval(checkExist); }, 5000);
        })();
        true;
    `;

    const handleBack = () => {
        setIsVisible(false);
        if (courseId) {
            router.replace({
                pathname: "/auth/courseDetail",
                params: { courseId, courseName }
            });
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: PRIMARY_COLOR }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <View style={[styles.headerContainer, { backgroundColor: PRIMARY_COLOR }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.webViewContainer}>
                <WebView 
                    ref={webViewRef}
                    key={url}
                    source={{ uri: url }} 
                    onLoadStart={() => setIsVisible(false)}
                    onLoadEnd={() => {
                        setTimeout(() => setIsVisible(true), 300);
                    }}
                    style={{ opacity: isVisible ? 1 : 0 }}
                    injectedJavaScriptBeforeContentLoaded={`
                        (function() {
                            var style = document.createElement('style');
                            style.innerHTML = \`${cssToInject}\`;
                            document.head.appendChild(style);
                        })();
                        true;
                    `}
                    injectedJavaScript={loginJS}
                    startInLoadingState={true}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    showsVerticalScrollIndicator={false}
                    renderLoading={() => (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                        </View>
                    )}
                />
                {!isVisible && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    backButton: { 
        padding: 5 
    },
    webViewContainer: {
        flex: 1,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    loader: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'white'
    }
});