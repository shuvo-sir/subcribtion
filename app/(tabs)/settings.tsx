import { useAuth, useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

  const handleUpdateName = async () => {
    try {
      if (!firstName.trim()) {
        Alert.alert("Error", "First name cannot be empty");
        return;
      }

      setIsUpdatingName(true);
      await user?.update({
        firstName,
        lastName,
      });

      Alert.alert("Success", "Profile name updated!");
      setShowNameModal(false);
    } catch (error) {
      console.error("Update name error:", error);
      Alert.alert("Error", "Failed to update profile name");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert("Error", "Please fill in all password fields");
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "New passwords do not match");
        return;
      }

      if (newPassword.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters long");
        return;
      }

      setIsUpdatingPassword(true);
      await user?.updatePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert("Success", "Password changed successfully!");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert(
        "Error",
        "Failed to change password. Please check your current password.",
      );
    } finally {
      setIsUpdatingPassword(false);
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

        {/* Settings Card */}
        <View className="bg-card border border-border rounded-2xl p-6 mb-6">
          <Text className="text-lg font-sans-bold text-primary mb-4">
            Account Settings
          </Text>

          {/* Change Profile Picture Button */}
          <Button
            onPress={handlePickImage}
            disabled={isUploading}
            className="bg-gray-800 rounded-xl py-3 px-4 items-center justify-center mb-3 active:opacity-70"
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-base font-sans-semibold text-white">
                Change Profile Picture
              </Text>
            )}
          </Button>

          {/* Update Profile Button */}
          <Button
            onPress={() => setShowNameModal(true)}
            className="bg-gray-700 rounded-xl py-3 px-4 items-center justify-center mb-3 active:opacity-70"
          >
            <Text className="text-base font-sans-semibold text-white">
              Update Profile
            </Text>
          </Button>

          {/* Change Password Button */}
          <Button
            onPress={() => setShowPasswordModal(true)}
            className="bg-gray-600 rounded-xl py-3 px-4 items-center justify-center active:opacity-70"
          >
            <Text className="text-base font-sans-semibold text-white">
              Change Password
            </Text>
          </Button>
        </View>

        <Button
          onPress={handleLogout}
          className="rounded-2xl py-4 items-center justify-center mt-auto active:opacity-80 mb-20 bg-black"
        >
          <Text className="text-white font-sans-bold">Logout</Text>
        </Button>
      </Container>

      {/* Update Profile Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 pb-10">
            <Text className="text-2xl font-sans-bold text-primary mb-6">
              Update Profile Name
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
                First Name
              </Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#999"
                className="bg-card border border-border rounded-lg px-4 py-3 text-primary"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
                Last Name
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#999"
                className="bg-card border border-border rounded-lg px-4 py-3 text-primary"
              />
            </View>

            <View className="flex-row gap-3">
              <Button
                onPress={() => setShowNameModal(false)}
                className="flex-1 bg-card border border-border rounded-lg py-3 items-center justify-center active:opacity-70"
              >
                <Text className="font-sans-semibold text-primary">Cancel</Text>
              </Button>
              <Button
                onPress={handleUpdateName}
                disabled={isUpdatingName}
                className="flex-1 bg-accent rounded-lg py-3 items-center justify-center active:opacity-80"
              >
                {isUpdatingName ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-sans-semibold text-white">Save</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <ScrollView
            className="bg-background rounded-t-3xl p-6"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <Text className="text-2xl font-sans-bold text-primary mb-6">
              Change Password
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
                Current Password
              </Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#999"
                secureTextEntry
                className="bg-card border border-border rounded-lg px-4 py-3 text-primary"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
                New Password
              </Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password (min 8 characters)"
                placeholderTextColor="#999"
                secureTextEntry
                className="bg-card border border-border rounded-lg px-4 py-3 text-primary"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
                Confirm Password
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                secureTextEntry
                className="bg-card border border-border rounded-lg px-4 py-3 text-primary"
              />
            </View>

            <View className="flex-row gap-3">
              <Button
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="flex-1 bg-card border border-border rounded-lg py-3 items-center justify-center active:opacity-70"
              >
                <Text className="font-sans-semibold text-primary">Cancel</Text>
              </Button>
              <Button
                onPress={handleChangePassword}
                disabled={isUpdatingPassword}
                className="flex-1 bg-accent rounded-lg py-3 items-center justify-center active:opacity-80"
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-sans-semibold text-white">Update</Text>
                )}
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;
