import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import FormInput from "../components/FormInput";
import COLOURS from "../constants/colours";
import { searchUsers, sendFriendRequest } from "../services/friendService";

export default function SearchFriendsScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
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
      const data = await searchUsers(query.trim());
      setResults(data);
    } catch (error) {
      setServerError(error.message);
    }
  }

  async function handleAddFriend(userId) {
    setServerError("");
    setSuccessMessage("");

    try {
      await sendFriendRequest(userId);
      setSuccessMessage("Friend request sent.");
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Find Friends</Text>

      <FormInput
        label="Search by username"
        value={query}
        onChangeText={setQuery}
        placeholder="maya"
      />

      {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
      {successMessage ? (
        <Text style={styles.success}>{successMessage}</Text>
      ) : null}

      <Pressable style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </Pressable>

      <View style={styles.results}>
        {results.map((user) => (
          <View key={user.id} style={styles.card}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.meta}>
              {user.home_country || "Unknown country"}
            </Text>

            <Pressable
              style={styles.addButton}
              onPress={() => handleAddFriend(user.id)}
            >
              <Text style={styles.addButtonText}>Add Friend</Text>
            </Pressable>
          </View>
        ))}
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
    paddingTop: 56,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 16,
  },
  error: {
    color: "#C0392B",
    marginBottom: 12,
    fontSize: 12,
  },
  success: {
    color: COLOURS.accent,
    marginBottom: 12,
    fontSize: 12,
  },
  searchButton: {
    backgroundColor: COLOURS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  results: {
    gap: 12,
  },
  card: {
    backgroundColor: COLOURS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOURS.border,
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
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: COLOURS.accentLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  addButtonText: {
    color: COLOURS.accent,
    fontWeight: "700",
    fontSize: 12,
  },
});
