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
    <SafeAreaView className="flex-1 bg-white">
      <Container className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6 text-black">Settings</Text>

        <LogoutButton
          onPress={handleLogout}
          className="bg-red-500 rounded-lg py-3 px-4 items-center justify-center mt-auto mb-4"
        >
          <Text className="text-white font-semibold text-lg">Logout</Text>
        </LogoutButton>
      </Container>
    </SafeAreaView>
  );
};

export default Settings;
