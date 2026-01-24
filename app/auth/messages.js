import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
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

  const primaryColor = isDark ? '#F55D69' : '#FF0000';

  const fetchConversations = async () => {
    if (!userToken || !userId) return;
    setLoading(true);
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
      fetchConversations();
    }, [userToken, userId])
  );

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
        style={[styles.card, { backgroundColor: theme.card }]} 
        onPress={() => router.push({
          pathname: '/auth/chatDetail',
          params: { contactId, contactName, contactImage }
        })}
      >
        <Image source={{ uri: contactImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{contactName}</Text>
          <Text style={[styles.lastMsg, { color: theme.textSecondary }]} numberOfLines={1}>{lastMsg}</Text>
        </View>
        {!isSearch && item.unreadcount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: primaryColor }]}>
            <Text style={styles.unreadText}>{item.unreadcount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      
      <View style={[styles.upperHeader, { backgroundColor: primaryColor }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={[styles.searchWrapper, { backgroundColor: isDark ? '#1A1A1A' : '#F2F2F2' }]}>
          <Text style={[styles.searchIcon, { color: theme.textSecondary }]}>🔍</Text>
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
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchConversations} tintColor={primaryColor} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  upperHeader: { 
    height: 80, 
    justifyContent: 'flex-end', 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: { padding: 5 },
  backIcon: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 25 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 15 },
  card: { flexDirection: 'row', padding: 15, borderRadius: 20, marginBottom: 12, alignItems: 'center', elevation: 1 },
  avatar: { width: 55, height: 55, borderRadius: 27.5 },
  info: { marginLeft: 15, flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  lastMsg: { fontSize: 13, marginTop: 4, opacity: 0.6 },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});

export default Messages;