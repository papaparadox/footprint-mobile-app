import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { compareWithFriend } from "../services/friendService";

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

function CompareStatCard({ title, countries, continents, coverage }) {
  return (
    <View style={styles.compareCard}>
      <Text style={styles.compareCardTitle}>{title}</Text>
      <Text style={styles.compareMainValue}>{countries}</Text>
      <Text style={styles.compareMainLabel}>Countries visited</Text>

      <View style={styles.compareMetaRow}>
        <Text style={styles.compareMetaText}>Continents: {continents}</Text>
        <Text style={styles.compareMetaText}>Coverage: {coverage}%</Text>
      </View>
    </View>
  );
}

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
        <Text style={styles.errorText}>{serverError}</Text>
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
        <Text style={styles.eyebrow}>Comparison</Text>
        <Text style={styles.heroTitle}>Journey Matchup</Text>
        <Text style={styles.heroSubtitle}>
          See where your travel stories overlap and differ.
        </Text>
      </View>

      <CompareStatCard
        title="You"
        countries={comparison?.my_stats?.countries_visited ?? 0}
        continents={comparison?.my_stats?.continents_visited ?? 0}
        coverage={comparison?.my_stats?.world_coverage_percent ?? 0}
      />

      <CompareStatCard
        title="Friend"
        countries={comparison?.friend_stats?.countries_visited ?? 0}
        continents={comparison?.friend_stats?.continents_visited ?? 0}
        coverage={comparison?.friend_stats?.world_coverage_percent ?? 0}
      />

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Common Countries</Text>
        {comparison?.overlap?.common_countries?.length > 0 ? (
          comparison.overlap.common_countries.map((country) => (
            <Text key={country.id} style={styles.countryItem}>
              {country.name}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No common countries yet.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Only You</Text>
        {comparison?.overlap?.only_mine?.length > 0 ? (
          comparison.overlap.only_mine.map((country) => (
            <Text key={country.id} style={styles.countryItem}>
              {country.name}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No unique countries yet.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Only Friend</Text>
        {comparison?.overlap?.only_theirs?.length > 0 ? (
          comparison.overlap.only_theirs.map((country) => (
            <Text key={country.id} style={styles.countryItem}>
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
  compareCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 14,
  },
  compareCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  compareMainValue: {
    fontSize: 28,
    fontWeight: "800",
    color: COLOURS.accent,
    marginBottom: 2,
  },
  compareMainLabel: {
    fontSize: 13,
    color: COLOURS.textSoft,
    marginBottom: 12,
  },
  compareMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  compareMetaText: {
    fontSize: 12,
    color: COLOURS.textSoft,
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
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 10,
  },
  countryItem: {
    fontSize: 13,
    color: COLOURS.textSoft,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3E7D7",
  },
  emptyText: {
    fontSize: 13,
    color: COLOURS.textMuted,
    fontStyle: "italic",
  },
  errorText: {
    color: COLOURS.danger,
    fontSize: 13,
  },
});
