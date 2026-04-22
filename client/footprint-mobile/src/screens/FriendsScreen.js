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
import {
  getFriends,
  removeFriend,
  getFriendRequests,
} from "../services/friendService";

const COLOURS = {
  bg: "#F5F0E8",
  card: "#FFFFFF",
  accent: "#C47B2B",
  accentLight: "#F0D9B5",
  text: "#1C1C1E",
  textSoft: "#6B6055",
  textMuted: "#A89B8C",
  border: "#E2D8CC",
  danger: "#C0392B",
};

function FriendCard({ friend, onView, onCompare, onRemove }) {
  return (
    <View style={styles.friendCard}>
      <View style={styles.friendTopRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>

        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friend.username}</Text>
          <Text style={styles.friendMeta}>
            {friend.home_country || "Unknown country"}
          </Text>
        </View>
      </View>

      <View style={styles.friendActions}>
        <Pressable
          style={styles.softActionBtn}
          onPress={() => onView(friend.id)}
        >
          <Text style={styles.softActionText}>View</Text>
        </Pressable>

        <Pressable
          style={styles.softActionBtn}
          onPress={() => onCompare(friend.id)}
        >
          <Text style={styles.softActionText}>Compare</Text>
        </Pressable>

        <Pressable style={styles.removeBtn} onPress={() => onRemove(friend.id)}>
          <Text style={styles.removeBtnText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [friendsData, requestsData] = await Promise.all([
          getFriends(),
          getFriendRequests(),
        ]);

        setFriends(friendsData || []);
        setRequestCount(requestsData?.incoming?.length || 0);
      } catch (error) {
        setServerError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Connections</Text>
        <Text style={styles.heroTitle}>Your travel circle</Text>
        <Text style={styles.heroSubtitle}>
          Compare journeys, check requests and stay connected with fellow
          explorers.
        </Text>
      </View>

      <View style={styles.quickActionsRow}>
        <Pressable
          style={styles.primaryTile}
          onPress={() => router.push("/friends/search")}
        >
          <Text style={styles.tileEmoji}>🔍</Text>
          <Text style={styles.primaryTileTitle}>Find Friends</Text>
          <Text style={styles.primaryTileSubtitle}>Search by username</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryTile}
          onPress={() => router.push("/friends/requests")}
        >
          <Text style={styles.tileEmoji}>📨</Text>
          <Text style={styles.secondaryTileTitle}>Requests</Text>
          <Text style={styles.secondaryTileSubtitle}>
            {requestCount} pending
          </Text>
        </Pressable>
      </View>

      {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <Text style={styles.sectionTitle}>Friends</Text>

      {friends.length > 0 ? (
        friends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onView={(id) => router.push(`/friends/${id}/profile`)}
            onCompare={(id) => router.push(`/friends/${id}/compare`)}
            onRemove={handleRemove}
          />
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No friends yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by searching for other travellers.
          </Text>
          <Pressable
            style={styles.emptyAction}
            onPress={() => router.push("/friends/search")}
          >
            <Text style={styles.emptyActionText}>Find Friends</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOURS.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOURS.bg,
  },
  heroCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: COLOURS.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLOURS.textSoft,
    lineHeight: 20,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  primaryTile: {
    flex: 1,
    backgroundColor: "#FFF6EA",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOURS.accentLight,
  },
  secondaryTile: {
    flex: 1,
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOURS.border,
  },
  tileEmoji: {
    fontSize: 22,
    marginBottom: 10,
  },
  primaryTileTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.accent,
    marginBottom: 4,
  },
  primaryTileSubtitle: {
    fontSize: 12,
    color: COLOURS.textSoft,
  },
  secondaryTileTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 4,
  },
  secondaryTileSubtitle: {
    fontSize: 12,
    color: COLOURS.textSoft,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  errorText: {
    color: COLOURS.danger,
    fontSize: 12,
    marginBottom: 12,
  },
  friendCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 12,
  },
  friendTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 2,
  },
  friendMeta: {
    fontSize: 12,
    color: COLOURS.textSoft,
  },
  friendActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  softActionBtn: {
    backgroundColor: COLOURS.accentLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  softActionText: {
    color: COLOURS.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  removeBtn: {
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeBtnText: {
    color: COLOURS.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLOURS.border,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLOURS.textSoft,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  emptyAction: {
    backgroundColor: COLOURS.accent,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  emptyActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
