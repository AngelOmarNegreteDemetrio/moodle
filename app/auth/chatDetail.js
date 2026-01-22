import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export const API_URL = "https://prueba.soluciones-hericraft.com/";
export const LOGIN_TOKEN = "27e4d95c2dae2f748d6b4e0d631f507f";
export const MY_USER_ID = 5; 

const ChatDetail = () => {
  const { userId, fullname } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef();
  const [message, setMessage] = useState('');
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    const url = `${API_URL}webservice/rest/server.php?wstoken=${LOGIN_TOKEN}&wsfunction=core_message_get_messages&moodlewsrestformat=json&useridto=${MY_USER_ID}&useridfrom=${userId}&read=0`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.messages) {
        const sortedMessages = data.messages.sort((a, b) => a.timecreated - b.timecreated);
        setMessagesList(sortedMessages);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const tempMessage = message.trim();
    setMessage('');
    setSending(true);

    const url = `${API_URL}webservice/rest/server.php?wstoken=${LOGIN_TOKEN}&wsfunction=core_message_send_instant_messages&moodlewsrestformat=json&messages[0][touserid]=${userId}&messages[0][text]=${encodeURIComponent(tempMessage)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data[0] && data[0].msgid) {
        const newMessage = {
          id: data[0].msgid,
          useridfrom: MY_USER_ID,
          smallmessage: tempMessage,
          timecreated: Date.now() / 1000
        };
        setMessagesList(prev => [...prev, newMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
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
      <View style={[styles.msgBubble, isMine ? styles.myMsg : styles.theirMsg]}>
        <Text style={[styles.msgText, isMine ? styles.myText : styles.theirText]}>
          {item.smallmessage}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.chatTitle}>{fullname}</Text>
          <Text style={styles.status}>En línea</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messagesList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 15 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Escribe un mensaje..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]} 
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerInfo: { flex: 1, alignItems: 'center' },
  backBtn: { fontSize: 28, color: '#007bff' },
  chatTitle: { fontSize: 17, fontWeight: 'bold' },
  status: { fontSize: 12, color: '#4caf50' },
  msgBubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
  myMsg: { alignSelf: 'flex-end', backgroundColor: '#007bff' },
  theirMsg: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  msgText: { fontSize: 15 },
  myText: { color: '#fff' },
  theirText: { color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  chatInput: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  sendBtn: { marginLeft: 10, backgroundColor: '#007bff', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#ccc' },
  sendText: { color: '#fff', fontWeight: 'bold' }
});

export default ChatDetail;