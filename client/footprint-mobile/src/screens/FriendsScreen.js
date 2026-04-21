import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import COLOURS from "../constants/colours";
import FriendCard from "../components/FriendCard";
import { getFriends, removeFriend } from "../services/friendService";

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function loadFriends() {
      try {
        const data = await getFriends();
        setFriends(data);
      } catch (error) {
        setServerError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadFriends();
  }, []);

  async function handleRemove(friendId) {
    try {
      await removeFriend(friendId);
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
    } catch (error) {
      setServerError(error.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLOURS.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>Connect and compare your journeys.</Text>
      </View>

      <View style={styles.topActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/friends/search")}
        >
          <Text style={styles.actionButtonText}>🔍 Find Friends</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/friends/requests")}
        >
          <Text style={styles.actionButtonText}>👥 Requests</Text>
        </Pressable>
      </View>

      {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

      <Text style={styles.sectionTitle}>Your Friends</Text>

      {friends.length > 0 ? (
        friends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} onRemove={handleRemove} />
        ))
      ) : (
        <Text style={styles.emptyText}>No friends yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOURS.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOURS.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLOURS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLOURS.textSoft,
    marginTop: 6,
  },
  topActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLOURS.accentLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLOURS.accent,
  },
  actionButtonText: {
    color: COLOURS.accent,
    fontWeight: "700",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  error: {
    color: "#C0392B",
    marginBottom: 12,
    fontSize: 12,
  },
  emptyText: {
    color: COLOURS.textMuted,
    fontStyle: "italic",
  },
});
