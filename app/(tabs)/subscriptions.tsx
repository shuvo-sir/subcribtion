import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter subscriptions based on search query
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.plan?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, subscriptions]);

  const handleCardPress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* KeyboardAvoidingView prevents the keyboard from covering the list on some devices */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          // Fix: Ensures touches are handled even if the keyboard is open
          keyboardShouldPersistTaps="handled"
          // Performance optimizations
          removeClippedSubviews={false}
          initialNumToRender={10}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View className="px-6 pt-4 pb-4">
                <Text className="text-2xl font-sans-bold text-foreground">
                  Subscriptions
                </Text>
              </View>

              {/* Search Input */}
              <View className="px-6 pb-4">
                <View className="bg-card px-4 py-1 rounded-lg border border-border">
                  <TextInput
                    placeholder="Search subscriptions..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="py-2 text-foreground h-12"
                    placeholderTextColor="rgba(150, 150, 150, 0.5)"
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                  />
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-foreground text-lg font-sans-medium">
                No subscriptions found
              </Text>
              <Text className="text-muted-foreground text-sm mt-1">
                Try a different search term
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="px-6 pb-3">
              <SubscriptionCard
                {...item}
                expanded={expandedId === item.id}
                onPress={() => handleCardPress(item.id)}
              />
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
