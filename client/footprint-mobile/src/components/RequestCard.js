import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import COLOURS from "../constants/colours";

export default function RequestCard({ request, type, onAccept, onDecline }) {
  return (
    <View style={styles.card}>
      <Text style={styles.username}>{request.username}</Text>
      <Text style={styles.meta}>
        {request.home_country || "Unknown country"}
      </Text>

      <View style={styles.actions}>
        {type === "incoming" ? (
          <>
            <Pressable
              style={styles.acceptButton}
              onPress={() => onAccept(request.id)}
            >
              <Text style={styles.acceptText}>Accept</Text>
            </Pressable>

            <Pressable
              style={styles.declineButton}
              onPress={() => onDecline(request.id)}
            >
              <Text style={styles.declineText}>Decline</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.pendingPill}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
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
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
  },
  meta: {
    fontSize: 12,
    color: COLOURS.textSoft,
    marginTop: 4,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  acceptButton: {
    backgroundColor: COLOURS.accentLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  acceptText: {
    color: COLOURS.accent,
    fontWeight: "700",
    fontSize: 12,
  },
  declineButton: {
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  declineText: {
    color: "#C0392B",
    fontWeight: "700",
    fontSize: 12,
  },
  pendingPill: {
    backgroundColor: COLOURS.bg,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pendingText: {
    fontSize: 12,
    color: COLOURS.textSoft,
    fontWeight: "600",
  },
});
