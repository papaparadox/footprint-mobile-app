import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import COLOURS from "../constants/colours";

export default function FriendCard({ friend, onRemove }) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.username}>{friend.username}</Text>
        <Text style={styles.meta}>
          {friend.home_country || "Unknown country"}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.smallButton}
          onPress={() => router.push(`/friends/${friend.id}/profile`)}
        >
          <Text style={styles.smallButtonText}>View</Text>
        </Pressable>

        <Pressable
          style={styles.smallButton}
          onPress={() => router.push(`/friends/${friend.id}/compare`)}
        >
          <Text style={styles.smallButtonText}>Compare</Text>
        </Pressable>

        {onRemove ? (
          <Pressable
            style={styles.removeButton}
            onPress={() => onRemove(friend.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLOURS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 20,
  },
  info: {
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
  },
  meta: {
    fontSize: 12,
    color: COLOURS.textSoft,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  smallButton: {
    backgroundColor: COLOURS.accentLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  smallButtonText: {
    color: COLOURS.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  removeButton: {
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    color: "#C0392B",
    fontSize: 12,
    fontWeight: "700",
  },
});
