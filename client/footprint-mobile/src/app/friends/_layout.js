import { Stack } from "expo-router";

export default function FriendsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#F5F0E8",
        },
        headerTintColor: "#C47B2B",
        headerTitleStyle: {
          fontWeight: "700",
          color: "#1C1C1E",
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: "#F5F0E8",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Friends" }} />
      <Stack.Screen name="requests" options={{ title: "Friend Requests" }} />
      <Stack.Screen name="search" options={{ title: "Find Friends" }} />
      <Stack.Screen
        name="[friendId]/profile"
        options={{ title: "Friend Profile" }}
      />
      <Stack.Screen
        name="[friendId]/compare"
        options={{ title: "Compare Journeys" }}
      />
    </Stack>
  );
}
