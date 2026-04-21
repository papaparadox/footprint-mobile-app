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
import { getFriendProfile } from "../services/friendService";

export default function FriendProfileScreen() {
  const { friendId } = useLocalSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getFriendProfile(friendId);
        setProfile(data);
      } catch (error) {
        setServerError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
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
      <View style={styles.heroCard}>
        <Text style={styles.title}>{profile?.user?.username}</Text>
        <Text style={styles.subtitle}>{profile?.user?.home_country}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {profile?.stats?.countries_visited ?? 0}
          </Text>
          <Text style={styles.statLabel}>Countries</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {profile?.stats?.continents_visited ?? 0}
          </Text>
          <Text style={styles.statLabel}>Continents</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Continent Breakdown</Text>
        {profile?.continent_breakdown?.length > 0 ? (
          profile.continent_breakdown.map((item, index) => (
            <Text key={index} style={styles.itemText}>
              {item.continent}: {item.countries_count}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No continent data yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Most Recent Visit</Text>
        {profile?.most_recent_visit ? (
          <Text style={styles.itemText}>
            {profile.most_recent_visit.country_name} (
            {profile.most_recent_visit.iso_code})
          </Text>
        ) : (
          <Text style={styles.emptyText}>No recent visit yet.</Text>
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLOURS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOURS.border,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOURS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLOURS.textSoft,
    marginTop: 4,
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
