import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../auth/authContext';
import { useTheme } from '../context/themeContext';

export const API_URL = "https://prueba.soluciones-hericraft.com/";

const Messages = () => {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const { userToken, userId } = useAuth();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);

    const PRIMARY_COLOR = isDark ? '#F55D69' : '#FF0000';

    const fetchConversations = async (showLoading = true) => {
        if (!userToken || !userId) return;
        if (showLoading) setLoading(true);
        const url = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_message_get_conversations&moodlewsrestformat=json&userid=${userId}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.conversations) setConversations(data.conversations);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchConversations(false);
        }, [userToken, userId])
    );

    const handlePressConversation = (contactId, contactName, contactImage, conversationId) => {
        setConversations(prev => 
            prev.map(conv => 
                conv.id === conversationId ? { ...conv, unreadcount: 0 } : conv
            )
        );

        router.push({
            pathname: '/auth/chatDetail',
            params: { contactId, contactName, contactImage }
        });
    };

    const searchUsers = async (text) => {
        setQuery(text);
        if (text.trim().length < 3) {
            setResults([]);
            return;
        }
        setLoading(true);
        const url = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=1`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (Array.isArray(data)) {
                const filtered = data
                    .filter(u => u.fullname.toLowerCase().includes(text.toLowerCase()))
                    .map(u => ({ id: u.id, fullname: u.fullname, avatar: u.profileimageurlsmall }));
                setResults(filtered);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const isSearch = query.length >= 3;
        const contactId = isSearch ? item.id : (item.members.find(m => m.id != userId)?.id || item.members[0].id);
        const contactName = isSearch ? item.fullname : (item.members.find(m => m.id != userId)?.fullname || item.members[0].fullname);
        const contactImage = isSearch ? item.avatar : (item.members.find(m => m.id != userId)?.profileimageurl || item.members[0].profileimageurl);
        const lastMsg = isSearch ? "Nuevo chat" : (item.messages?.[0]?.text.replace(/<[^>]*>?/gm, '') || "Sin mensajes");

        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.card, { backgroundColor: theme.card }]} 
                onPress={() => handlePressConversation(contactId, contactName, contactImage, item.id)}
            >
                <Image source={{ uri: contactImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <View style={styles.info}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{contactName}</Text>
                    <Text style={{ color: theme.textSecondary }} numberOfLines={1}>{lastMsg}</Text>
                </View>
                {!isSearch && item.unreadcount > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: PRIMARY_COLOR }]}>
                        <Text style={styles.unreadText}>{item.unreadcount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} translucent={false} />
            
            <View style={[styles.headerWrapper, { backgroundColor: PRIMARY_COLOR }]}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.sideButton}>
                            <Ionicons name="arrow-back" size={28} color="white" />
                        </TouchableOpacity>

                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>Chats</Text>
                        </View>

                        <View style={styles.sideButton} />
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.container}>
                <View style={styles.body}>
                    <View style={[styles.searchWrapper, { backgroundColor: isDark ? '#1A1A1A' : '#F2F2F2' }]}>
                        <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 10 }} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Buscar contacto..."
                            value={query}
                            onChangeText={searchUsers}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <FlatList
                        data={query.length >= 3 ? results : conversations}
                        keyExtractor={(item, index) => (query.length >= 3 ? `s-${item.id}` : `c-${item.id}`)}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={() => fetchConversations(true)} tintColor={PRIMARY_COLOR} />
                        }
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerWrapper: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    sideButton: { 
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: { flex: 1 },
    body: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    input: { flex: 1, height: '100%', fontSize: 15 },
    card: { 
        flexDirection: 'row', 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 12, 
        alignItems: 'center', 
        elevation: 2,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, 
        shadowRadius: 2,
    },
    avatar: { width: 55, height: 55, borderRadius: 27.5 },
    info: { marginLeft: 15, flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});

export default Messages;