import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
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

const ChatDetail = () => {
    const { contactId, contactName, contactImage } = useLocalSearchParams();
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const { userToken, userId: MY_USER_ID } = useAuth();
    
    const flatListRef = useRef();
    const [message, setMessage] = useState('');
    const [messagesList, setMessagesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const PRIMARY_COLOR = isDark ? '#F55D69' : '#FF0000';

    const markAsRead = useCallback(async () => {
        if (!userToken || !contactId || !MY_USER_ID) return;
        const url = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_message_mark_all_conversation_messages_as_read&moodlewsrestformat=json&userid=${MY_USER_ID}&conversationid=0&otheruserid=${contactId}`;
        try {
            await fetch(url);
        } catch (err) {
            console.log("Error al marcar como leído:", err);
        }
    }, [userToken, contactId, MY_USER_ID]);

    const fetchMessages = useCallback(async () => {
        if (!userToken || !contactId || !MY_USER_ID) return;
        const urlRec = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_message_get_messages&moodlewsrestformat=json&useridto=${MY_USER_ID}&useridfrom=${contactId}`;
        const urlSent = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_message_get_messages&moodlewsrestformat=json&useridto=${contactId}&useridfrom=${MY_USER_ID}`;
        
        try {
            const [resRec, resSent] = await Promise.all([fetch(urlRec), fetch(urlSent)]);
            const dataRec = await resRec.json();
            const dataSent = await resSent.json();
            let allMessages = [];
            if (dataRec.messages) allMessages = [...allMessages, ...dataRec.messages];
            if (dataSent.messages) allMessages = [...allMessages, ...dataSent.messages];

            if (allMessages.length > 0) {
                const formatted = allMessages
                    .map(msg => ({
                        id: msg.id.toString(),
                        useridfrom: msg.useridfrom,
                        text: msg.smallmessage.replace(/<[^>]*>?/gm, ''),
                        time: msg.timecreated
                    }))
                    .sort((a, b) => a.time - b.time);
                setMessagesList(formatted);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, [userToken, contactId, MY_USER_ID]);

    useEffect(() => {
        fetchMessages();
        markAsRead();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages, markAsRead]);

    const sendMessage = async () => {
        if (!message.trim() || !userToken) return;
        const tempMessage = message.trim();
        setMessage('');
        setSending(true);
        const url = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_message_send_instant_messages&moodlewsrestformat=json&messages[0][touserid]=${contactId}&messages[0][text]=${encodeURIComponent(tempMessage)}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data[0]?.msgid) {
                fetchMessages();
                markAsRead();
            }
        } catch (err) {
            console.log(err);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isMine = item.useridfrom == MY_USER_ID;
        return (
            <View style={[styles.msgWrapper, isMine ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
                <View style={[
                    styles.msgBubble, 
                    isMine 
                        ? { backgroundColor: PRIMARY_COLOR, borderBottomRightRadius: 4 } 
                        : { backgroundColor: isDark ? '#262626' : '#F2F2F2', borderBottomLeftRadius: 4 }
                ]}>
                    <Text style={[styles.msgText, { color: isMine ? '#fff' : theme.text }]}>{item.text}</Text>
                </View>
            </View>
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
                            <Image source={{ uri: contactImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                            <View>
                                <Text style={styles.headerTitle} numberOfLines={1}>{contactName}</Text>
                                <Text style={styles.status}>En línea</Text>
                            </View>
                        </View>

                        <View style={styles.sideButton} />
                    </View>
                </SafeAreaView>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messagesList}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                    <TextInput
                        style={[styles.chatInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, borderWidth: 1 }]}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor="#999"
                        value={message}
                        onChangeText={setMessage}
                        multiline={false}
                    />
                    <TouchableOpacity 
                        style={[styles.sendBtn, { backgroundColor: PRIMARY_COLOR }, (!message.trim() || sending) && { opacity: 0.6 }]} 
                        onPress={sendMessage}
                        disabled={!message.trim() || sending}
                    >
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
        paddingHorizontal: 50
    },
    headerTitle: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    avatar: { 
        width: 38, 
        height: 38, 
        borderRadius: 19, 
        marginRight: 10, 
        borderWidth: 1, 
        borderColor: '#fff' 
    },
    status: { 
        fontSize: 11, 
        color: 'rgba(255,255,255,0.8)', 
        textAlign: 'left' 
    },
    sideButton: { 
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    msgWrapper: { marginBottom: 15, maxWidth: '80%' },
    msgBubble: { padding: 12, borderRadius: 18, elevation: 1 },
    msgText: { fontSize: 15, lineHeight: 20 },
    inputContainer: { 
        flexDirection: 'row', 
        padding: 10, 
        alignItems: 'center', 
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        borderTopWidth: 0.5 
    },
    chatInput: { 
        flex: 1, 
        borderRadius: 25, 
        paddingHorizontal: 15, 
        height: 45, 
        fontSize: 15 
    },
    sendBtn: { 
        marginLeft: 8, 
        borderRadius: 25, 
        width: 45, 
        height: 45, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 2 
    }
});

export default ChatDetail;