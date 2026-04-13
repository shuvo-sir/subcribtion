import { useAuth, useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const Container = styled(View);
const Button = styled(Pressable);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      // 1. Check Permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need access to your photos to change your profile picture.",
        );
        return;
      }

      // 2. Pick Image with Base64 enabled
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      // 3. Upload to Clerk
      if (!result.canceled && user && result.assets[0].base64) {
        setIsUploading(true);
        const asset = result.assets[0];

        // Format as Data URI for Clerk
        const base64Image = `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`;

        await user.setProfileImage({ file: base64Image });
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Error", "Failed to update profile image.");
    } finally {
      setIsUploading(false);
    }
  };

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

        <View className="mb-8 items-center">
          <View className="mb-4 relative">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-accent items-center justify-center">
                <Text className="text-3xl font-sans-bold text-primary">
                  {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <Button
              onPress={handlePickImage}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-accent rounded-full w-8 h-8 items-center justify-center border-2 border-background"
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#081126" />
              ) : (
                <Text className="text-lg">+</Text>
              )}
            </Button>
          </View>

          <Text className="text-xl font-sans-bold text-primary text-center">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-sm text-muted-foreground text-center mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        <Button
          onPress={handlePickImage}
          disabled={isUploading}
          className="bg-card border border-border rounded-2xl py-3 px-4 items-center justify-center mb-6 active:opacity-70"
        >
          {isUploading ? (
            <ActivityIndicator color="#081126" />
          ) : (
            <Text className="text-base font-sans-semibold text-primary">
              Change Profile Picture
            </Text>
          )}
        </Button>

        <Button
          onPress={handleLogout}
          className=" rounded-2xl py-4 items-center justify-center mt-auto  active:opacity-80 mb-20 bg-accent"
        >
          <Text className="text-white font-sans-bold">Logout</Text>
        </Button>
      </Container>
    </SafeAreaView>
  );
};

export default Settings;
