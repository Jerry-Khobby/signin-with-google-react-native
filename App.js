import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.CLIENT_ID_ANDROID,
    webClientId: "",
    iosClientId: process.env.CLIENT_ID_IOS,
  });

  useEffect(() => {
    if (response) {
      console.log("Response received:", response);
      handleSignInWithGoogle();
    }
  }, [response]);

  async function handleSignInWithGoogle() {
    const user = await AsyncStorage.getItem("@user");
    if (!user) {
      if (response?.type === "success") {
        console.log("Fetching user info...");
        await getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(JSON.parse(user));
      console.log("User loaded from AsyncStorage:", user);
    }
  }

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
      console.log("User info fetched and saved:", user);
    } catch (error) {
      console.log("Error fetching user info:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>
          User Info: {userInfo ? JSON.stringify(userInfo) : "No user logged in"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}
      >
        <Text style={styles.buttonText}>Sign In with Google</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#4285F4", // Google blue color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
