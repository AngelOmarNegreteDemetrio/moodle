import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/themeContext';

export default function LanguageScreen() {
    const { theme, isDark } = useTheme();
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const PRIMARY = isDark ? theme.primary : "#FF0000";
    const currentLang = i18n?.language || 'es';

    const handleSave = async (lang) => {
        if (i18n) {
            await i18n.changeLanguage(lang);
            router.back();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>
                {t('settings.language_title')}
            </Text>
            
            <Text style={[
                styles.subtitle, 
                { color: isDark ? '#AAAAAA' : '#666666' }
            ]}>
                {t('settings.language_subtitle')}
            </Text>

            <View style={styles.list}>
                <TouchableOpacity 
                    activeOpacity={0.7}
                    style={[
                        styles.option, 
                        { 
                            backgroundColor: theme.card,
                            borderColor: currentLang.includes('es') ? PRIMARY : 'transparent',
                            borderWidth: 2 
                        }
                    ]}
                    onPress={() => handleSave('es')}
                >
                    <Text style={[styles.optionText, { color: theme.text }]}>🇲🇽 Español</Text>
                    {currentLang.includes('es') && (
                        <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    activeOpacity={0.7}
                    style={[
                        styles.option, 
                        { 
                            backgroundColor: theme.card,
                            borderColor: currentLang.includes('en') ? PRIMARY : 'transparent',
                            borderWidth: 2 
                        }
                    ]}
                    onPress={() => handleSave('en')}
                >
                    <Text style={[styles.optionText, { color: theme.text }]}>🇺🇸 English</Text>
                    {currentLang.includes('en') && (
                        <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 25, 
        justifyContent: 'center' 
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        textAlign: 'center' 
    },
    subtitle: { 
        fontSize: 16, 
        marginBottom: 30, 
        textAlign: 'center', 
        paddingHorizontal: 20 
    },
    list: { 
        gap: 15 
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    optionText: { 
        fontSize: 18, 
        fontWeight: '600' 
    }
});