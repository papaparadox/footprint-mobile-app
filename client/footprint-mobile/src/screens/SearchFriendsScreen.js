import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import FormInput from "../components/FormInput";
import { searchUsers, sendFriendRequest } from "../services/friendService";

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

function SearchResultCard({ user, onAdd }) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultTopRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>

        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{user.username}</Text>
          <Text style={styles.resultMeta}>
            {user.home_country || "Unknown country"}
          </Text>
        </View>
      </View>

      <Pressable style={styles.addButton} onPress={() => onAdd(user.id)}>
        <Text style={styles.addButtonText}>Send Friend Request</Text>
      </Pressable>
    </View>
  );
}

export default function SearchFriendsScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSearch() {
    setServerError("");
    setSuccessMessage("");

    if (!query.trim()) {
      setServerError("Please enter a username.");
      return;
    }

    try {
      setLoading(true);
      const users = await searchUsers(query.trim());
      setResults(users || []);
    } catch (error) {
      setServerError(error.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFriend(userId) {
    setServerError("");
    setSuccessMessage("");

    try {
      await sendFriendRequest(userId);
      setSuccessMessage("Friend request sent successfully.");
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Discover</Text>
        <Text style={styles.heroTitle}>Find Friends</Text>
        <Text style={styles.heroSubtitle}>
          Search travellers by username and grow your travel circle.
        </Text>
      </View>

      <View style={styles.searchCard}>
        <FormInput
          label="Search by username"
          value={query}
          onChangeText={setQuery}
          placeholder="maya"
        />

        {serverError ? (
          <Text style={styles.errorText}>{serverError}</Text>
        ) : null}
        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>
            {loading ? "Searching..." : "Search Friends"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Results</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLOURS.accent} />
        </View>
      ) : results.length > 0 ? (
        results.map((user) => (
          <SearchResultCard key={user.id} user={user} onAdd={handleAddFriend} />
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptySubtitle}>
            Search for a username to discover fellow explorers.
          </Text>
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
  searchCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 18,
  },
  searchButton: {
    backgroundColor: COLOURS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: COLOURS.danger,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  successText: {
    color: COLOURS.accent,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 12,
  },
  resultTopRow: {
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
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 2,
  },
  resultMeta: {
    fontSize: 12,
    color: COLOURS.textSoft,
  },
  addButton: {
    backgroundColor: "#FFF6EA",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLOURS.accentLight,
  },
  addButtonText: {
    color: COLOURS.accent,
    fontSize: 13,
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
  },
});
