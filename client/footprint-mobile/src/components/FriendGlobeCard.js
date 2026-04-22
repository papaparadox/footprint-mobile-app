import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GlobeView from "./GlobeView";
import COLOURS from "../constants/colours";

export default function FriendGlobeCard({
  friendName = "Friend",
  selectedCountries = [],
  onMessage,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{friendName}'s Globe</Text>
      <Text style={styles.subtitle}>
        Countries visited: {selectedCountries.length}
      </Text>

      <GlobeView selectedCountries={selectedCountries} onMessage={onMessage} />
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
});
