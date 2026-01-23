import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
    userToken: null,
    userId: null,
    isLoading: true,
    login: () => {},
    logout: () => {}
});

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const token = await AsyncStorage.getItem('moodleToken');
            const id = await AsyncStorage.getItem('moodleUserId');
            if (token) setUserToken(token);
            if (id) setUserId(id);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

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