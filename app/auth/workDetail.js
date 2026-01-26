import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../auth/authContext';
import { useTheme } from '../context/themeContext';

export default function WorkDetailScreen() {
    const router = useRouter();
    const { url, courseId, courseName } = useLocalSearchParams();
    const { isDark } = useTheme();
    const { userData } = useAuth();
    const webViewRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const PRIMARY_COLOR = isDark ? '#F55D69' : '#FF0000';

    const loginJS = `
        (function() {
            var user = ${JSON.stringify(userData?.username || '')};
            var pass = ${JSON.stringify(userData?.password || '')};

            if(!user || !pass) return;

            var checkExist = setInterval(function() {
                var userField = document.querySelector('input[name="username"], #username');
                var passField = document.querySelector('input[name="password"], #password');
                var loginBtn = document.querySelector('button[type="submit"], #loginbtn, .btn-primary');

                if (userField && passField && loginBtn) {
                    userField.value = user;
                    passField.value = pass;
                    
                    setTimeout(function() {
                        loginBtn.click();
                    }, 250);
                    
                    clearInterval(checkExist);
                }
            }, 200);
            
            setTimeout(function() { clearInterval(checkExist); }, 8000);
        })();
        true;
    `;

    const handleBack = () => {
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
                    source={{ uri: url }} 
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => {
                        webViewRef.current.injectJavaScript(loginJS);
                        setLoading(false);
                    }}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    startInLoadingState={true}
                    cacheEnabled={false}
                />
                {loading && (
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
    backButton: { padding: 5 },
    webViewContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    loader: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'white'
    }
});