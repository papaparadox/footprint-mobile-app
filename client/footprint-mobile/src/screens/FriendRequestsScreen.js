import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import COLOURS from "../constants/colours";
import RequestCard from "../components/RequestCard";
import {
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from "../services/friendService";

export default function FriendRequestsScreen() {
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await getFriendRequests();
        setRequests(data);
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Friend Requests</Text>

      {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

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

      <Text style={styles.sectionTitle}>Outgoing</Text>
      {requests.outgoing.length > 0 ? (
        requests.outgoing.map((request) => (
          <RequestCard key={request.id} request={request} type="outgoing" />
        ))
      ) : (
        <Text style={styles.emptyText}>No outgoing requests.</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
    marginTop: 10,
  },
  error: {
    color: "#C0392B",
    marginBottom: 12,
    fontSize: 12,
  },
  emptyText: {
    color: COLOURS.textMuted,
    fontStyle: "italic",
    marginBottom: 16,
  },
});
