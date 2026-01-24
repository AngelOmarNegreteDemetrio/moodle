import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
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

const Messages = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    const url = `${API_URL}webservice/rest/server.php?wstoken=${LOGIN_TOKEN}&wsfunction=core_message_get_conversations&moodlewsrestformat=json&userid=${MY_USER_ID}&type=0`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
    }, [])
  );

  const searchUsers = async (text) => {
    setQuery(text);
    if (text.trim().length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    const url = `${API_URL}webservice/rest/server.php?wstoken=${LOGIN_TOKEN}&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=1`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        const filtered = data
          .filter(user => user.fullname.toLowerCase().includes(text.toLowerCase()))
          .map(user => ({
            id: user.id,
            fullname: user.fullname,
            avatar: user.profileimageurlsmall
          }));
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
    const userId = isSearch ? item.id : item.members[0].id;
    const fullname = isSearch ? item.fullname : item.members[0].fullname;
    const avatar = isSearch ? item.avatar : item.members[0].profileimageurl;
    const subText = isSearch ? "Iniciar nuevo chat" : (item.messages[0]?.text.replace(/<[^>]*>/g, '') || "Sin mensajes");

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push({
          pathname: '/auth/chatDetail',
          params: { userId, fullname }
        })}
      >
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{fullname}</Text>
          <Text style={styles.lastMsg} numberOfLines={1}>{subText}</Text>
        </View>
        {!isSearch && item.unreadcount > 0 && (
          <View style={styles.unreadDot} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mensajes</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar contacto..."
          value={query}
          onChangeText={searchUsers}
          placeholderTextColor="#999"
        />

        <Text style={styles.sectionTitle}>
          {query.length >= 3 ? "Resultados de búsqueda" : "Conversaciones recientes"}
        </Text>

        <FlatList
          data={query.length >= 3 ? results : conversations}
          keyExtractor={(item, index) => (item.id || index).toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchConversations} />
          }
          ListEmptyComponent={() => (
            !loading && <Text style={styles.empty}>No se encontraron contactos o chats.</Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 20, color: '#000' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#aaa', marginVertical: 10, textTransform: 'uppercase' },
  input: { height: 45, backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 15, marginVertical: 10 },
  card: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
  info: { marginLeft: 15, flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  lastMsg: { fontSize: 14, color: '#888', marginTop: 2 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007bff' },
  empty: { textAlign: 'center', marginTop: 50, color: '#bbb' }
});

export default Messages;