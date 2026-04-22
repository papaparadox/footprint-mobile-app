import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  compareWithFriend,
  travelChatWithFriend,
} from "../services/friendService";
import GlobeView from "../components/GlobeView";
import TravelAssistantChat from "../components/TravelAssistantChat";
import COLOURS from "../constants/colours";

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

function CompareGlobeCard({ myCountries, friendCountries, onMessage }) {
  const [activeTab, setActiveTab] = useState("mine");

  const commonCountries = useMemo(() => {
    return myCountries.filter((country) => friendCountries.includes(country));
  }, [myCountries, friendCountries]);

  const selectedCountries = useMemo(() => {
    if (activeTab === "mine") return myCountries;
    if (activeTab === "friend") return friendCountries;
    return commonCountries;
  }, [activeTab, myCountries, friendCountries, commonCountries]);

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Compare Globe</Text>

      <View style={styles.tabRow}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "mine" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("mine")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "mine" && styles.activeTabText,
            ]}
          >
            Mine
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            activeTab === "friend" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("friend")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friend" && styles.activeTabText,
            ]}
          >
            Friend
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            activeTab === "common" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("common")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "common" && styles.activeTabText,
            ]}
          >
            Common
          </Text>
        </Pressable>
      </View>

      <GlobeView selectedCountries={selectedCountries} onMessage={onMessage} />

      <Text style={styles.globeCountText}>
        Showing {selectedCountries.length} countries
      </Text>
    </View>
  );
}

export default function CompareFriendScreen() {
  const { friendId } = useLocalSearchParams();

  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "ai",
      text: "I can help you and your friend discover a destination that is new to both of you.",
    },
    {
      id: "welcome-2",
      sender: "ai",
      text: "Choose how much time you have, and I’ll suggest a shared next trip.",
    },
  ]);

  useEffect(() => {
    async function loadComparison() {
      try {
        const data = await compareWithFriend(friendId, "3-5-days");
        setComparison(data.comparison || data);
      } catch (error) {
        setServerError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, [friendId]);

  async function handleSelectDuration(option) {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: option.label,
      },
    ]);

    try {
      const data = await travelChatWithFriend(friendId, {
        duration: option.key,
        message: `Suggest a destination for ${option.label}`,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          suggestion: data.suggestion,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          sender: "ai",
          text: error.message,
        },
      ]);
    }
  }

  async function handleAnotherOption() {
    try {
      const data = await travelChatWithFriend(friendId, {
        duration: "3-5-days",
        message: "Give me another option",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-alt-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          suggestion: data.suggestion,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-alt-error-${Date.now()}`,
          sender: "ai",
          text: error.message,
        },
      ]);
    }
  }

  function handleGlobeMessage(event) {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log("Compare globe message:", message);
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

  const commonCountries =
    comparison?.overlap?.common_countries?.map((country) => country.name) || [];

  const myCountries = [
    ...(comparison?.overlap?.only_mine?.map((country) => country.name) || []),
    ...commonCountries,
  ];

  const friendCountries = [
    ...(comparison?.overlap?.only_theirs?.map((country) => country.name) || []),
    ...commonCountries,
  ];

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
          Compare your travel stories and discover where to go together next.
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

      <TravelAssistantChat
        messages={messages}
        onSelectDuration={handleSelectDuration}
        onAnotherOption={handleAnotherOption}
      />

      <CompareGlobeCard
        myCountries={myCountries}
        friendCountries={friendCountries}
        onMessage={handleGlobeMessage}
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
  screen: { flex: 1, backgroundColor: COLOURS.bg },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 130,
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
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    backgroundColor: COLOURS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOURS.border,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: COLOURS.accentLight,
    borderColor: COLOURS.accent,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.textSoft,
  },
  activeTabText: {
    color: COLOURS.accent,
  },
  globeCountText: {
    marginTop: 10,
    fontSize: 12,
    color: COLOURS.textMuted,
    textAlign: "center",
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
