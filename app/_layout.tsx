import { useRouter, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';

import '../language/i18n';

import { AuthProvider, useAuth } from '../app/auth/authContext';
import { ThemeProvider, useTheme } from '../app/context/themeContext';
import MenuContent, { CustomHeader } from '../components/navigation/menu';

function AppWrapper() {
    const { theme, isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const { userToken, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [i18n.language]);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';
        const isLoginPage = segments[1] === 'Login';

        if (!userToken) {
            if (!inAuthGroup || !isLoginPage) {
                router.replace('/auth/Login');
            }
        } else {
            if (inAuthGroup && isLoginPage) {
                router.replace('/');
            }
        }
    }, [userToken, isLoading, segments]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <Drawer
                    drawerContent={(props) => <MenuContent {...props} />}
                    screenOptions={({ navigation }) => ({
                        headerShown: !!userToken, 
                        header: () => (
                            <CustomHeader onMenuPress={() => navigation.toggleDrawer()} />
                        ),
                        drawerType: 'slide', 
                        drawerStyle: { 
                            width: '75%',
                            backgroundColor: theme.menuBackground,
                        },
                        sceneContainerStyle: {
                            backgroundColor: theme.background,
                        },
                        swipeEnabled: !!userToken
                    })}
                >
                    <Drawer.Screen 
                        name="auth/Login" 
                        options={{ 
                            headerShown: false, 
                            title: t('menu.login'),
                            drawerItemStyle: { display: 'none' } 
                        }} 
                    />
                    
                    <Drawer.Screen 
                        name="index" 
                        options={{ 
                            title: 'College',
                            drawerItemStyle: userToken ? {} : { display: 'none' }
                        }} 
                    />
                    <Drawer.Screen 
                        name="auth/course" 
                        options={{ 
                            title: t('menu.courses'),
                            drawerItemStyle: userToken ? {} : { display: 'none' }
                        }} 
                    />
                    <Drawer.Screen 
                        name="auth/testScreen" 
                        options={{ 
                            title: t('menu.profile'),
                            drawerItemStyle: userToken ? {} : { display: 'none' }
                        }} 
                    />
                    <Drawer.Screen 
                        name="auth/portfolio" 
                        options={{ 
                            title: t('menu.cv'),
                            drawerItemStyle: userToken ? {} : { display: 'none' }
                        }} 
                    />
                    
                    <Drawer.Screen name="auth/messages" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
                    <Drawer.Screen name="auth/notifications" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
                    <Drawer.Screen name="auth/courseDetail" options={{ title: t('menu.courseDetail'), headerShown: false }} />
                    <Drawer.Screen name="auth/workDetail" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
                    <Drawer.Screen name="auth/chatDetail" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
                    <Drawer.Screen name="auth/language" options={{ title: t('menu.language'), drawerItemStyle: { display: 'none' } }} />
                </Drawer>
            </Animated.View>

            {isLoading && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', zIndex: 999 }]}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            )}
        </View>
    );
}

export default function MainLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AppWrapper />
            </ThemeProvider>
        </AuthProvider>
    );
}