import { useSignIn } from "@clerk/expo";
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
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
        router.replace("/(tabs)/" as Href);
      }
    } catch (err: any) {
      setFormError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="auth-safe-area">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="auth-content justify-center">
            <View className="auth-brand-block">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">A</Text>
              </View>
              <Text className="auth-wordmark">Adrian</Text>
            </View>

            <View className="auth-card">
              <Text className="text-2xl font-bold text-primary mb-6">
                Welcome Back
              </Text>

              {formError && (
                <View className="mb-4 bg-destructive/10 p-3 rounded-xl">
                  <Text className="text-destructive text-xs">{formError}</Text>
                </View>
              )}

              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className="auth-input"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(v) => setFormData({ ...formData, email: v })}
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className="auth-input"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(v) =>
                    setFormData({ ...formData, password: v })
                  }
                />
              </View>

              <Pressable
                className="auth-button mt-4"
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="auth-button-text">Continue</Text>
                )}
              </Pressable>
            </View>

            <View className="auth-link-row">
              <Text className="text-sm text-muted-foreground">
                Don't have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-up">
                <Text className="auth-link text-sm">Sign up</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
