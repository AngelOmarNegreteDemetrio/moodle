import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("moodleToken");

      if (!token) {
        router.replace("/auth/Login");
      }
    };

    checkToken();
  }, []);
}