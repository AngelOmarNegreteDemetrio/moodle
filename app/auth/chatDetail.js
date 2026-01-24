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

  const primaryColor = isDark ? '#F55D69' : '#FF0000';

  const fetchMessages = useCallback(async () => {
    if (!userToken || !contactId) return;
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
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!message.trim() || !userToken) return;
    const tempMessage = message.trim();
    setMessage('');
    setSending(true);
    const url = `${API_URL}webservice/rest/server.php?wstoken=${userToken}&wsfunction=core_message_send_instant_messages&moodlewsrestformat=json&messages[0][touserid]=${contactId}&messages[0][text]=${encodeURIComponent(tempMessage)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data[0]?.msgid) fetchMessages();
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
            ? { backgroundColor: primaryColor, borderBottomRightRadius: 4 } 
            : { backgroundColor: isDark ? '#262626' : '#F2F2F2', borderBottomLeftRadius: 4 }
        ]}>
          <Text style={[styles.msgText, { color: isMine ? '#fff' : theme.text }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} translucent={false} />
      
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Image source={{ uri: contactImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.chatTitle}>{contactName}</Text>
          <Text style={styles.status}>En línea</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} style={{ flex: 1 }} />
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

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
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
            style={[styles.sendBtn, { backgroundColor: primaryColor }, (!message.trim() || sending) && { opacity: 0.6 }]} 
            onPress={sendMessage}
            disabled={!message.trim() || sending}
          >
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: Platform.OS === 'ios' ? 70 : 90, 
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10
  },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12, borderWidth: 1.5, borderColor: '#fff' },
  headerInfo: { flex: 1 },
  backBtn: { paddingRight: 10 },
  backArrow: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  chatTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  status: { fontSize: 12, color: '#E0E0E0', fontWeight: '500' },
  msgWrapper: { marginBottom: 15, maxWidth: '80%' },
  msgBubble: { padding: 15, borderRadius: 20, elevation: 1 },
  msgText: { fontSize: 15, lineHeight: 21 },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    alignItems: 'center', 
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
    borderTopWidth: 1 
  },
  chatInput: { flex: 1, borderRadius: 25, paddingHorizontal: 20, height: 48, fontSize: 15 },
  sendBtn: { marginLeft: 10, borderRadius: 25, paddingHorizontal: 22, height: 48, justifyContent: 'center', elevation: 3 },
  sendText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});

export default ChatDetail;