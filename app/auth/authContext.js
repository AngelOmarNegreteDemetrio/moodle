import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
    userToken: null,
    userId: null,
    userData: { username: '', password: '' },
    isLoading: true,
    login: (token, id, username, password) => {},
    logout: () => {}
});

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const [token, id, lastUser] = await Promise.all([
                    AsyncStorage.getItem('moodleToken'),
                    AsyncStorage.getItem('moodleUserId'),
                    AsyncStorage.getItem('lastLoggedInUsername')
                ]);

                if (token && id) {
                    setUserToken(token);
                    setUserId(id);
                    setUserData({ username: lastUser || '', password: '' });
                }
            } catch (e) {
                console.error("Error cargando datos de Auth:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStoredData();
    }, []);

    const login = async (token, id, username, password) => {
        try {
            const stringId = String(id);

            await Promise.all([
                AsyncStorage.setItem('moodleToken', token),
                AsyncStorage.setItem('moodleUserId', stringId),
                AsyncStorage.setItem('lastLoggedInUsername', username)
            ]);

            setUserToken(token);
            setUserId(stringId);
            setUserData({ username, password });
            
        } catch (e) {
            console.error("Error al guardar login:", e);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['moodleToken', 'moodleUserId', 'lastLoggedInUsername']);
            setUserToken(null);
            setUserId(null);
            setUserData({ username: '', password: '' });
        } catch (e) {
            console.error("Error en logout:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, userId, userData, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;