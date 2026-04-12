import { useSignIn } from "@clerk/clerk-expo";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignInScreen() {
  // Added 'setActive' - this is required to save the session on the device
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setFormError("");
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === "complete") {
        // CRITICAL: This sets the session as active so you don't get redirected back to sign-in
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/" as Href);
      } else {
        // Handle 2FA or other requirements if needed
        console.log("Incomplete sign in status:", result.status);
      }
    } catch (err: any) {
      // Clerks errors are usually nested in an array
      const errorMessage =
        err?.errors?.[0]?.message || "Invalid email or password.";
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Brand Header */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">A</Text>
            </View>
            <Text className="text-3xl font-bold text-slate-900">Adrian</Text>
            <Text className="text-slate-500 text-base">Welcome Back</Text>
          </View>

          {/* Sign In Card */}
          <View className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
            <Text className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Sign In
            </Text>

            {formError ? (
              <View className="mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">
                <Text className="text-red-600 text-xs text-center font-medium">
                  {formError}
                </Text>
              </View>
            ) : null}

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-1 ml-1">
                  Email
                </Text>
                <TextInput
                  className="h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900"
                  autoCapitalize="none"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(v) => setFormData({ ...formData, email: v })}
                />
              </View>

              <View className="mt-4">
                <Text className="text-sm font-semibold text-slate-700 mb-1 ml-1">
                  Password
                </Text>
                <TextInput
                  className="h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900"
                  placeholder="Your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(v) =>
                    setFormData({ ...formData, password: v })
                  }
                />
              </View>

              <Pressable
                className="h-14 bg-blue-600 rounded-2xl items-center justify-center mt-6 shadow-md active:opacity-90"
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-lg">Continue</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-slate-500 text-sm">
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-up">
              <Text className="text-blue-600 font-bold text-sm">Sign up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
