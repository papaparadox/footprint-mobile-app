import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import GlobeView from "./GlobeView";
import COLOURS from "../constants/colours";

export default function CompareGlobeCard({
  myCountries = [],
  friendCountries = [],
  onMessage,
}) {
  const [activeTab, setActiveTab] = useState("mine");

  const commonCountries = useMemo(() => {
    return myCountries.filter((country) => friendCountries.includes(country));
  }, [myCountries, friendCountries]);

  const selectedCountries = useMemo(() => {
    if (activeTab === "mine") return myCountries;
    if (activeTab === "friend") return friendCountries;
    return commonCountries;
  }, [activeTab, myCountries, friendCountries, commonCountries]);

  const title = useMemo(() => {
    if (activeTab === "mine") return "My Globe";
    if (activeTab === "friend") return "Friend Globe";
    return "Common Countries";
  }, [activeTab]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Compare Globe View</Text>
      <Text style={styles.subtitle}>{title}</Text>

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

      <Text style={styles.countText}>
        Showing {selectedCountries.length} countries
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLOURS.textSoft,
    marginBottom: 12,
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
  countText: {
    marginTop: 10,
    fontSize: 12,
    color: COLOURS.textMuted,
    textAlign: "center",
  },
});
