import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import COLOURS from "../constants/colours";
import { compareWithFriend } from "../services/friendService";

export default function CompareFriendScreen() {
  const { friendId } = useLocalSearchParams();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function loadComparison() {
      try {
        const data = await compareWithFriend(friendId);
        setComparison(data);
      } catch (error) {
        setServerError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, [friendId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLOURS.accent} />
      </View>
    );
  }

  if (serverError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{serverError}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Compare Journeys</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <Text style={styles.itemText}>
          Countries: {comparison?.my_stats?.countries_visited ?? 0}
        </Text>
        <Text style={styles.itemText}>
          Continents: {comparison?.my_stats?.continents_visited ?? 0}
        </Text>
        <Text style={styles.itemText}>
          World Coverage: {comparison?.my_stats?.world_coverage_percent ?? 0}%
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Friend Stats</Text>
        <Text style={styles.itemText}>
          Countries: {comparison?.friend_stats?.countries_visited ?? 0}
        </Text>
        <Text style={styles.itemText}>
          Continents: {comparison?.friend_stats?.continents_visited ?? 0}
        </Text>
        <Text style={styles.itemText}>
          World Coverage:{" "}
          {comparison?.friend_stats?.world_coverage_percent ?? 0}%
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Common Countries</Text>
        {comparison?.overlap?.common_countries?.length > 0 ? (
          comparison.overlap.common_countries.map((country) => (
            <Text key={country.id} style={styles.itemText}>
              {country.name}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No common countries yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Only You</Text>
        {comparison?.overlap?.only_mine?.length > 0 ? (
          comparison.overlap.only_mine.map((country) => (
            <Text key={country.id} style={styles.itemText}>
              {country.name}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No unique countries yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Only Friend</Text>
        {comparison?.overlap?.only_theirs?.length > 0 ? (
          comparison.overlap.only_theirs.map((country) => (
            <Text key={country.id} style={styles.itemText}>
              {country.name}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No unique countries yet.</Text>
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
  card: {
    backgroundColor: COLOURS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 13,
    color: COLOURS.textSoft,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: COLOURS.textMuted,
    fontStyle: "italic",
  },
  error: {
    color: "#C0392B",
    fontSize: 13,
  },
});
