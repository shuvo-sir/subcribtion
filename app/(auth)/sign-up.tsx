import {
  validateEmail,
  validateFullName,
  validatePassword,
  validatePasswordMatch,
} from "@/lib/utils";
import { useSignUp } from "@clerk/clerk-expo";
import clsx from "clsx";
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

// Simple two-step sign-up flow: 1) collect email, password, and full name, 2) verify email with code

type SignUpStep = "form" | "verification";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export default function SignUpScreen() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<SignUpStep>("form");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleFieldChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const emailError = validateEmail(formData.email);
    if (emailError) errors[emailError.field] = emailError.message;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors[passwordError.field] = passwordError.message;

    const passwordMatchError = validatePasswordMatch(
      formData.password,
      formData.confirmPassword,
    );
    if (passwordMatchError)
      errors[passwordMatchError.field] = passwordMatchError.message;

    if (formData.fullName) {
      const nameError = validateFullName(formData.fullName);
      if (nameError) errors[nameError.field] = nameError.message;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (): Promise<void> => {
    if (!isLoaded || !signUp || !validateForm()) return;

    setFormError("");
    setIsLoading(true);

    try {
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setStep("verification");
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || "Sign up failed.";
      setFormError(String(message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!isLoaded || !signUp || !verificationCode.trim()) {
      setFieldErrors({ verificationCode: "Verification code is required" });
      return;
    }
    setFormError("");
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (completeSignUp.status === "complete") {
        router.replace("/(tabs)/" as Href);
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      setFormError(err?.errors?.[0]?.message || "Invalid code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (!isLoaded || !signUp) return;
    setResendLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err: any) {
      setFormError("Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="auth-safe-area">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="auth-content justify-center">
            <View className="auth-brand-block">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">A</Text>
              </View>
              <Text className="auth-wordmark">Adrian</Text>
              <Text className="auth-wordmark-sub">Subscription Manager</Text>
            </View>

            <View className="auth-card">
              <Text className="text-2xl font-bold text-primary mb-2">
                {step === "form" ? "Create Account" : "Verify Email"}
              </Text>
              <Text className="text-sm text-muted-foreground mb-6">
                {step === "form"
                  ? "Start tracking your subscriptions"
                  : `Sent to ${formData.email}`}
              </Text>

              {formError && (
                <View
                  style={{
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#dc2626",
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    borderRadius: 16,
                    padding: 12,
                  }}
                >
                  <Text className="text-xs text-destructive font-medium">
                    {formError}
                  </Text>
                </View>
              )}

              {step === "form" ? (
                <>
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={clsx("auth-input", {
                        "auth-input-error": fieldErrors["email"],
                      })}
                      placeholder="email@example.com"
                      placeholderTextColor="#a0a0a0"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={formData.email}
                      onChangeText={(v) => handleFieldChange("email", v)}
                    />
                  </View>
                  <View className="auth-field">
                    <Text className="auth-label">Full Name</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="John Doe"
                      placeholderTextColor="#a0a0a0"
                      value={formData.fullName}
                      onChangeText={(v) => handleFieldChange("fullName", v)}
                    />
                  </View>
                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="8+ characters"
                      placeholderTextColor="#a0a0a0"
                      secureTextEntry
                      value={formData.password}
                      onChangeText={(v) => handleFieldChange("password", v)}
                    />
                  </View>
                  <View className="auth-field">
                    <Text className="auth-label">Confirm Password</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="Repeat your password"
                      placeholderTextColor="#a0a0a0"
                      secureTextEntry
                      value={formData.confirmPassword}
                      onChangeText={(v) =>
                        handleFieldChange("confirmPassword", v)
                      }
                    />
                  </View>
                  <Pressable
                    className="auth-button mt-4"
                    onPress={handleSignUp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="auth-button-text">Create Account</Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  <TextInput
                    className="auth-input"
                    style={{
                      textAlign: "center",
                      fontSize: 20,
                      letterSpacing: 2,
                    }}
                    placeholder="000000"
                    placeholderTextColor="#a0a0a0"
                    maxLength={6}
                    keyboardType="number-pad"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                  />
                  <Pressable
                    className="auth-button mt-4"
                    onPress={handleVerifyCode}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="auth-button-text">Verify</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={handleResendCode}
                    disabled={resendLoading}
                    className="mt-4"
                  >
                    {resendLoading ? (
                      <ActivityIndicator color="#ea7a53" size="small" />
                    ) : (
                      <Text className="auth-secondary-button-text text-center">
                        Resend Code
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>

            <View className="auth-link-row">
              <Text className="text-sm text-muted-foreground">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-in">
                <Text className="auth-link text-sm">Sign in</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
