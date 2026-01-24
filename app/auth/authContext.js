import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
    userToken: null,
    userId: null,
    isLoading: true,
    login: (token, id) => {},
    logout: () => {}
});

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const clearOnStart = async () => {
            try {
                await AsyncStorage.multiRemove(['moodleToken', 'moodleUserId']);
                setUserToken(null);
                setUserId(null);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        clearOnStart();
    }, []);

    const login = async (token, id) => {
        setUserToken(token);
        setUserId(id);
        await AsyncStorage.setItem('moodleToken', token);
        await AsyncStorage.setItem('moodleUserId', id.toString());
    };

    const logout = async () => {
        setUserToken(null);
        setUserId(null);
        await AsyncStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ userToken, userId, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;

