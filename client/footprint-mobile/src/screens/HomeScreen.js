import React from "react";
import { View, Text, StyleSheet } from "react-native";
import COLOURS from "../constants/colours";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.brand}>Footprint</Text>
        <Text style={styles.title}>Welcome to your journey</Text>
        <Text style={styles.globe}>🌍</Text>
        <Text style={styles.comingSoon}>Coming soon</Text>
        <Text style={styles.subtitle}>
          Your travel map, stats, and memories will live here soon.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOURS.bg,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLOURS.card,
    borderRadius: 22,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLOURS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  brand: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  globe: {
    fontSize: 72,
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOURS.accent,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLOURS.textSoft,
    textAlign: "center",
    lineHeight: 22,
  },
});
