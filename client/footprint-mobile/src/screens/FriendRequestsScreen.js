import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
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

function RequestCard({ request, type, onAccept, onDecline }) {
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestTopRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>

        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{request.username}</Text>
          <Text style={styles.requestMeta}>
            {request.home_country || "Unknown country"}
          </Text>
        </View>
      </View>

      {type === "incoming" ? (
        <View style={styles.requestActions}>
          <Pressable
            style={styles.acceptButton}
            onPress={() => onAccept(request.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </Pressable>

          <Pressable
            style={styles.declineButton}
            onPress={() => onDecline(request.id)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.pendingWrap}>
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      )}
    </View>
  );
}

export default function FriendRequestsScreen() {
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await getFriendRequests();
        setRequests(data || { incoming: [], outgoing: [] });
      } catch (error) {
        setServerError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  async function handleAccept(requestId) {
    try {
      await acceptFriendRequest(requestId);
      setRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((item) => item.id !== requestId),
      }));
    } catch (error) {
      setServerError(error.message);
    }
  }

  async function handleDecline(requestId) {
    try {
      await declineFriendRequest(requestId);
      setRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((item) => item.id !== requestId),
      }));
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
        <Text style={styles.eyebrow}>Social</Text>
        <Text style={styles.heroTitle}>Friend Requests</Text>
        <Text style={styles.heroSubtitle}>
          Review incoming requests and track outgoing invitations.
        </Text>
      </View>

      {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Incoming</Text>

        {requests.incoming.length > 0 ? (
          requests.incoming.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              type="incoming"
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No incoming requests.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Outgoing</Text>

        {requests.outgoing.length > 0 ? (
          requests.outgoing.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              type="outgoing"
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No outgoing requests.</Text>
        )}
      </View>
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
    paddingBottom: 120,
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
  errorText: {
    color: COLOURS.danger,
    fontSize: 12,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: "#FFF9F2",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOURS.accentLight,
    marginBottom: 10,
  },
  requestTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 2,
  },
  requestMeta: {
    fontSize: 12,
    color: COLOURS.textSoft,
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLOURS.accent,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  declineButton: {
    flex: 1,
    backgroundColor: COLOURS.card,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLOURS.border,
  },
  declineButtonText: {
    color: COLOURS.textSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  pendingWrap: {
    alignSelf: "flex-start",
    backgroundColor: COLOURS.accentLight,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pendingText: {
    color: COLOURS.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    color: COLOURS.textMuted,
    fontStyle: "italic",
  },
});
