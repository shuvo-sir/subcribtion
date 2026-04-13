import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const Container = styled(View);
const LogoutButton = styled(Pressable);

const Settings = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Container className="flex-1 p-5">
        <Text className="text-2xl font-sans-bold mb-6 text-primary">
          Settings
        </Text>

        <LogoutButton
          onPress={handleLogout}
          className="auth-button mt-auto mb-4"
        >
          <Text className="auth-button-text">Logout</Text>
        </LogoutButton>
      </Container>
    </SafeAreaView>
  );
};

export default Settings;
