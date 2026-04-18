import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#FF6B6B",
  "AI Tools": "#4ECDC4",
  "Developer Tools": "#FFE66D",
  Design: "#F5C542",
  Productivity: "#95E1D3",
  Cloud: "#B8D4E3",
  Music: "#F8A5C8",
  Other: "#D4A5F8",
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const posthog = usePostHog();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(
    CATEGORIES[0],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Subscription name is required";
    }

    const priceNum = parseFloat(price);
    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateForm()) return;

    const today = dayjs();
    const priceNum = parseFloat(price);

    const renewalDate =
      frequency === "Monthly"
        ? today.add(1, "month").toISOString()
        : today.add(1, "year").toISOString();

    const newSubscription: Subscription = {
      id: `subscription-${Date.now()}`,
      name: name.trim(),
      price: priceNum,
      currency: "USD",
      category,
      status: "active",
      startDate: today.toISOString(),
      renewalDate,
      icon: icons.wallet,
      billing: frequency,
      color: CATEGORY_COLORS[category],
    };

    // Track subscription created event
    posthog.capture("subscription_created", {
      name: newSubscription.name,
      price: priceNum,
      category,
      frequency,
      currency: "USD",
    });

    onCreate(newSubscription);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory(CATEGORIES[0]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <StyledView className="modal-overlay">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <StyledView className="modal-container">
            {/* Header */}
            <StyledView className="modal-header">
              <StyledText className="modal-title">New Subscription</StyledText>
              <StyledPressable onPress={handleClose} className="modal-close">
                <StyledText className="modal-close-text">×</StyledText>
              </StyledPressable>
            </StyledView>

            {/* Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <StyledView className="modal-body">
                {/* Name Field */}
                <StyledView className="gap-2">
                  <StyledText className="auth-label">
                    Subscription Name
                  </StyledText>
                  <StyledTextInput
                    className={clsx(
                      "auth-input",
                      errors.name && "auth-input-error",
                    )}
                    placeholder="e.g., Netflix"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    value={name}
                    onChangeText={setName}
                  />
                  {errors.name && (
                    <StyledText className="auth-error">
                      {errors.name}
                    </StyledText>
                  )}
                </StyledView>

                {/* Price Field */}
                <StyledView className="gap-2">
                  <StyledText className="auth-label">Price (USD)</StyledText>
                  <StyledTextInput
                    className={clsx(
                      "auth-input",
                      errors.price && "auth-input-error",
                    )}
                    placeholder="e.g., 12.99"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                  />
                  {errors.price && (
                    <StyledText className="auth-error">
                      {errors.price}
                    </StyledText>
                  )}
                </StyledView>

                {/* Frequency Field */}
                <StyledView className="gap-2">
                  <StyledText className="auth-label">Frequency</StyledText>
                  <StyledView className="picker-row">
                    {(["Monthly", "Yearly"] as const).map((freq) => (
                      <StyledPressable
                        key={freq}
                        onPress={() => setFrequency(freq)}
                        className={clsx(
                          "picker-option",
                          frequency === freq && "picker-option-active",
                        )}
                      >
                        <StyledText
                          className={clsx(
                            "picker-option-text",
                            frequency === freq && "picker-option-text-active",
                          )}
                        >
                          {freq}
                        </StyledText>
                      </StyledPressable>
                    ))}
                  </StyledView>
                </StyledView>

                {/* Category Field */}
                <StyledView className="gap-2">
                  <StyledText className="auth-label">Category</StyledText>
                  <StyledView className="category-scroll">
                    {CATEGORIES.map((cat) => (
                      <StyledPressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        className={clsx(
                          "category-chip",
                          category === cat && "category-chip-active",
                        )}
                      >
                        <StyledText
                          className={clsx(
                            "category-chip-text",
                            category === cat && "category-chip-text-active",
                          )}
                        >
                          {cat}
                        </StyledText>
                      </StyledPressable>
                    ))}
                  </StyledView>
                </StyledView>

                {/* Submit Button */}
                <StyledPressable
                  onPress={handleCreate}
                  className={clsx("auth-button", "mt-6")}
                >
                  <StyledText className="auth-button-text">
                    Add Subscription
                  </StyledText>
                </StyledPressable>
              </StyledView>
            </ScrollView>
          </StyledView>
        </KeyboardAvoidingView>
      </StyledView>
    </Modal>
  );
}
