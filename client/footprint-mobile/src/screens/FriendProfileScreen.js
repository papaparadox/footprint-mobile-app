import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getFriendProfile } from "../services/friendService";
import GlobeView from "../components/GlobeView";
import COLOURS from "../constants/colours";

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FriendGlobeCard({ friendName, selectedCountries, onMessage }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{friendName}'s Globe</Text>
      <Text style={styles.cardSubtitle}>
        Countries visited: {selectedCountries.length}
      </Text>

      <GlobeView selectedCountries={selectedCountries} onMessage={onMessage} />
    </View>
  );
}

export default function FriendProfileScreen() {
  const router = useRouter();
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

  function handleGlobeMessage(event) {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log("Friend globe message:", message);
    } catch (error) {
      console.log("Globe parse error:", error.message);
    }
  }

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

  const friendName = profile?.user?.username || "Friend";

  const friendCountries =
    profile?.visited_countries?.map((country) => country.name) || [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroAvatar}>
          <Text style={styles.heroAvatarEmoji}>👤</Text>
        </View>

        <Text style={styles.heroTitle}>{profile?.user?.username}</Text>
        <Text style={styles.heroSubtitle}>
          {profile?.user?.home_country || "Unknown country"}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatBox
          value={profile?.stats?.countries_visited ?? 0}
          label="Countries"
        />
        <StatBox
          value={profile?.stats?.continents_visited ?? 0}
          label="Continents"
        />
      </View>

      <FriendGlobeCard
        friendName={friendName}
        selectedCountries={friendCountries}
        onMessage={handleGlobeMessage}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Continent Breakdown</Text>

        {profile?.continent_breakdown?.length > 0 ? (
          profile.continent_breakdown.map((item, index) => (
            <View key={index} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{item.continent}</Text>
              <Text style={styles.breakdownValue}>{item.countries_count}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No continent data yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Recent Visit</Text>

        {profile?.most_recent_visit ? (
          <>
            <Text style={styles.visitCountry}>
              {profile.most_recent_visit.country_name}
            </Text>
            <Text style={styles.visitMeta}>
              {profile.most_recent_visit.iso_code}
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>No recent visit yet.</Text>
        )}
      </View>

      <Pressable
        style={styles.compareButton}
        onPress={() => router.push(`/friends/${friendId}/compare`)}
      >
        <Text style={styles.compareButtonText}>Compare Journeys</Text>
      </Pressable>
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
    padding: 22,
    borderWidth: 1,
    borderColor: COLOURS.border,
    alignItems: "center",
    marginBottom: 16,
  },
  heroAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  heroAvatarEmoji: {
    fontSize: 32,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLOURS.textSoft,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLOURS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLOURS.border,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLOURS.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLOURS.textSoft,
  },
  card: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLOURS.textSoft,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3E7D7",
  },
  breakdownLabel: {
    fontSize: 13,
    color: COLOURS.textSoft,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLOURS.accent,
  },
  visitCountry: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 4,
  },
  visitMeta: {
    fontSize: 13,
    color: COLOURS.textSoft,
  },
  compareButton: {
    backgroundColor: COLOURS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  compareButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: COLOURS.danger,
    fontSize: 13,
  },
  emptyText: {
    fontSize: 13,
    color: COLOURS.textMuted,
    fontStyle: "italic",
  },
});
