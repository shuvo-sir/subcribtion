import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Home() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/(auth)/sign-up" className="mt-4 text-lg text-primary">
        Sign Up
      </Link>
      <Link href="/(auth)/sign-in" className="mt-2 text-lg text-primary">
        Sign In
      </Link>

      <Link href={"/subscriptions/sportify"}>Sportify Subscription</Link>
      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
      >
        Claude Subscription
      </Link>
    </SafeAreaView>
  );
}
