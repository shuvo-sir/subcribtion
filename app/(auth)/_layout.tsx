import "@/global.css";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // 1. Better Loading State
  // Returning a View instead of null helps prevent layout jumps
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // 2. Auth Protection Logic
  // If already signed in, push them to the main app tabs
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // 3. Stack Configuration
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Using a HEX code here instead of a string name
        // sometimes bypasses strict style-parsing errors
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: "Sign In" }} />
      <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
    </Stack>
  );
}
