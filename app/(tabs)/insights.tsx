import SubscriptionCard from "@/components/SubscriptionCard";
import UpComingSubscriptionsCard from "@/components/UpComingSubscriptions";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

interface MonthlyExpense {
  month: string;
  amount: number;
  subscriptions: Subscription[];
}

const Insights = () => {
  const { subscriptions } = useSubscriptions();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Calculate monthly expenses for the last 6 months
  const calculateMonthlyExpenses = (): MonthlyExpense[] => {
    const months: Record<string, MonthlyExpense> = {};
    const currentDate = dayjs();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = currentDate.subtract(i, "month");
      const monthKey = monthDate.format("YYYY-MM");
      const monthLabel = monthDate.format("MMM");
      months[monthKey] = { month: monthLabel, amount: 0, subscriptions: [] };
    }

    // Calculate expenses for each subscription
    subscriptions.forEach((sub) => {
      const renewalDate = dayjs(sub.renewalDate);
      if (!renewalDate.isValid()) return;

      const monthKey = renewalDate.format("YYYY-MM");
      if (months[monthKey]) {
        months[monthKey].amount += sub.price;
        months[monthKey].subscriptions.push(sub);
      }
    });

    return Object.values(months);
  };

  const monthlyExpenses = calculateMonthlyExpenses();
  const currentMonth = monthlyExpenses[monthlyExpenses.length - 1];
  const totalCurrentMonthExpense = currentMonth?.amount || 0;
  const maxExpense = Math.max(...monthlyExpenses.map((m) => m.amount), 1);

  // Get upcoming subscriptions (renewals in next 7 days)
  const getUpcomingSubscriptions = () => {
    const today = dayjs();
    return subscriptions
      .map((sub) => {
        const renewalDate = dayjs(sub.renewalDate);
        const daysLeft = renewalDate.diff(today, "day");
        return {
          ...sub,
          daysLeft: Math.max(0, daysLeft),
        };
      })
      .filter((sub) => sub.daysLeft <= 7 && sub.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  };

  const upcomingSubscriptions = getUpcomingSubscriptions();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StyledScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <StyledView className="px-6 py-4">
          <StyledText className="text-3xl font-extrabold text-primary">
            Monthly Insights
          </StyledText>
        </StyledView>

        {/* Upcoming Section */}
        {upcomingSubscriptions.length > 0 && (
          <StyledView className="px-6 py-4">
            <StyledText className="text-xl font-bold text-primary mb-4">
              Upcoming Renewals
            </StyledText>
            <StyledScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {upcomingSubscriptions.map((sub) => (
                <UpComingSubscriptionsCard
                  key={sub.id}
                  id={sub.id}
                  name={sub.name}
                  price={sub.price}
                  currency={sub.currency}
                  icon={sub.icon}
                  daysLeft={sub.daysLeft}
                />
              ))}
            </StyledScrollView>
          </StyledView>
        )}

        {/* Bar Chart - Monthly Expenses */}
        <StyledView className="px-6 py-4">
          <StyledText className="text-lg font-bold text-primary mb-4">
            Monthly Trend
          </StyledText>
          <StyledView className="bg-gray-50 rounded-2xl p-4">
            <StyledView className="flex-row items-end justify-around h-40 gap-1">
              {monthlyExpenses.map((month, index) => {
                const height =
                  maxExpense > 0 ? (month.amount / maxExpense) * 140 : 0;
                return (
                  <StyledView
                    key={index}
                    className="flex-1 items-center justify-end"
                  >
                    <StyledView
                      className="w-full bg-blue-500 rounded-t-lg"
                      style={{ height: Math.max(height, 8) }}
                    />
                    <StyledText className="text-xs text-gray-600 mt-2 font-medium">
                      {month.month}
                    </StyledText>
                  </StyledView>
                );
              })}
            </StyledView>
            <StyledText className="text-xs text-gray-500 mt-3 text-center">
              Subscription renewal costs
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Total Expenses Card - Current Month */}
        <StyledView className="px-6 py-4">
          <StyledView
            style={{ backgroundColor: "#EF4444" }}
            className="rounded-2xl p-6"
          >
            <StyledText className="text-white text-sm font-medium mb-2">
              Total Expenses This Month
            </StyledText>
            <StyledText className="text-white text-4xl font-extrabold">
              {formatCurrency(totalCurrentMonthExpense, "USD")}
            </StyledText>
            <StyledText className="text-white text-xs mt-3 opacity-80">
              {currentMonth?.subscriptions.length || 0} subscriptions renewing
            </StyledText>
          </StyledView>
        </StyledView>

        {/* History Section - All Subscriptions */}
        <StyledView className="px-6 py-4 pb-16">
          <StyledText className="text-lg font-bold text-primary mb-4">
            Subscription History
          </StyledText>
          <StyledView className="gap-3 pb-6">
            {subscriptions.length > 0 ? (
              subscriptions.map((subscription) => (
                <StyledPressable
                  key={subscription.id}
                  onPress={() =>
                    setExpandedCard(
                      expandedCard === subscription.id ? null : subscription.id,
                    )
                  }
                >
                  <SubscriptionCard
                    {...subscription}
                    expanded={expandedCard === subscription.id}
                    onPress={() =>
                      setExpandedCard(
                        expandedCard === subscription.id
                          ? null
                          : subscription.id,
                      )
                    }
                  />
                </StyledPressable>
              ))
            ) : (
              <StyledView className="py-8 items-center">
                <StyledText className="text-gray-500 text-center">
                  No subscriptions yet
                </StyledText>
              </StyledView>
            )}
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </SafeAreaView>
  );
};

export default Insights;
