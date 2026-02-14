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

    const formatTime = (unixTimestamp) => {
        const date = new Date(unixTimestamp * 1000);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${strMinutes} ${ampm}`;
    };

    const markMessagesAsRead = useCallback(async () => {
        if (!userToken || !contactId || !MY_USER_ID) return;
        try {
            const url = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_message_mark_all_conversation_messages_as_read&moodlewsrestformat=json&userid=${MY_USER_ID}&otheruserid=${contactId}`;
            await fetch(url);
        } catch (err) {
            console.log("Error marking as read:", err);
        }
    }, [userToken, contactId, MY_USER_ID]);

    const fetchMessages = useCallback(async () => {
        if (!userToken || !contactId || !MY_USER_ID) return;
        
        const baseUrl = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&moodlewsrestformat=json&wsfunction=core_message_get_messages`;
        
        const urls = [
            `${baseUrl}&useridto=${MY_USER_ID}&useridfrom=${contactId}&read=0`,
            `${baseUrl}&useridto=${MY_USER_ID}&useridfrom=${contactId}&read=1`,
            `${baseUrl}&useridto=${contactId}&useridfrom=${MY_USER_ID}&read=0`,
            `${baseUrl}&useridto=${contactId}&useridfrom=${MY_USER_ID}&read=1`
        ];

        try {
            const responses = await Promise.all(urls.map(u => fetch(u)));
            const results = await Promise.all(responses.map(r => r.json()));
            
            let allMessages = [];
            results.forEach(data => {
                if (data?.messages) allMessages = [...allMessages, ...data.messages];
            });

            const filteredByCurrentChat = allMessages.filter(msg => 
                (msg.useridfrom == contactId && msg.useridto == MY_USER_ID) ||
                (msg.useridfrom == MY_USER_ID && msg.useridto == contactId)
            );

            if (filteredByCurrentChat.length > 0) {
                const uniqueMessages = Array.from(new Map(filteredByCurrentChat.map(m => [m.id, m])).values());
                
                const cleanList = uniqueMessages.map(msg => ({
                    uniqueKey: msg.id.toString(),
                    id: msg.id.toString(),
                    useridfrom: msg.useridfrom,
                    text: (msg.smallmessage || "").replace(/<[^>]*>?/gm, ''),
                    time: msg.timecreated
                })).sort((a, b) => a.time - b.time);

                setMessagesList(cleanList);
                
                const hasUnread = allMessages.some(m => m.useridfrom == contactId && !m.timeread);
                if (hasUnread) {
                    markMessagesAsRead();
                }
            } else {
                setMessagesList([]);
            }
        } catch (err) {
            console.log("Fetch fail:", err);
        } finally {
            setLoading(false);
        }
    }, [userToken, contactId, MY_USER_ID, markMessagesAsRead]);

    useEffect(() => {
        setLoading(true);
        setMessagesList([]);
        fetchMessages();

        const loop = setInterval(fetchMessages, 4000);

        return () => {
            clearInterval(loop);
            setMessagesList([]);
        };
    }, [contactId, fetchMessages]);

    const forceScroll = () => {
        if (messagesList.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
        }
    };

    useEffect(() => {
        if (!loading) forceScroll();
    }, [loading, messagesList.length]);

    const sendMessage = async () => {
        if (!message.trim() || !userToken || sending) return;
        const text = message.trim();
        setMessage('');
        setSending(true);
        
        const url = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_message_send_instant_messages&moodlewsrestformat=json&messages[0][touserid]=${contactId}&messages[0][text]=${encodeURIComponent(text)}`;
        
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data[0]?.msgid) {
                fetchMessages();
            }
        } catch (err) {
            console.log("Send fail:", err);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isMine = item.useridfrom == MY_USER_ID;
        return (
            <View style={[styles.msgWrapper, isMine ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
                <View style={[styles.msgBubble, { backgroundColor: isMine ? PRIMARY_COLOR : (isDark ? '#262626' : '#F2F2F2') }]}>
                    <Text style={{ fontSize: 16, color: isMine ? '#fff' : theme.text }}>{item.text}</Text>
                    <Text style={[styles.timeText, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}>
                        {formatTime(item.time)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View key={contactId} style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} translucent={false} />
            <View style={[styles.headerWrapper, { backgroundColor: PRIMARY_COLOR }]}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.replace('/auth/messages')} style={styles.sideBtn}>
                            <Ionicons name="arrow-back" size={28} color="white" />
                        </TouchableOpacity>
                        <View style={styles.userInfoContainer}>
                            <Image 
                                source={{ uri: contactImage || 'https://via.placeholder.com/150' }} 
                                style={styles.chatAvatar} 
                            />
                            <Text style={styles.chatName} numberOfLines={1}>{contactName}</Text>
                        </View>
                        <View style={styles.sideBtnPlaceholder} />
                    </View>
                </SafeAreaView>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messagesList}
                    keyExtractor={(item) => item.uniqueKey}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 20 }}
                    onContentSizeChange={forceScroll}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={80} color={isDark ? '#333' : '#E0E0E0'} />
                            <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 10 }}>No hay mensajes aún.</Text>
                        </View>
                    }
                />
            )}

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 90}>
                <View style={[styles.bottomBar, { backgroundColor: theme.card }]}>
                    <TextInput
                        style={[styles.chatInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, borderWidth: 1 }]}
                        placeholder="Mensaje..."
                        placeholderTextColor="#999"
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity 
                        style={[styles.sendCircle, { backgroundColor: PRIMARY_COLOR }]} 
                        onPress={sendMessage} 
                        disabled={!message.trim() || sending}
                    >
                        {sending ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="send" size={20} color="white" />}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    headerWrapper: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, elevation: 4 },
    headerContent: { flexDirection: 'row', alignItems: 'center', height: 60, paddingHorizontal: 10 },
    userInfoContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
    chatName: { color: 'white', fontSize: 17, fontWeight: 'bold', flex: 1, marginLeft: 10 },
    chatAvatar: { width: 40, height: 40, borderRadius: 20 },
    sideBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    sideBtnPlaceholder: { width: 10 },
    emptyContainer: { marginTop: 50, alignItems: 'center' },
    msgWrapper: { marginBottom: 15, maxWidth: '85%' },
    msgBubble: { padding: 12, borderRadius: 18, minWidth: 80 },
    timeText: { fontSize: 10, marginTop: 4, textAlign: 'right' },
    bottomBar: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 0.5 },
    chatInput: { flex: 1, borderRadius: 25, paddingHorizontal: 15, height: 45 },
    sendCircle: { marginLeft: 8, borderRadius: 25, width: 45, height: 45, justifyContent: 'center', alignItems: 'center' }
});

export default ChatDetail;