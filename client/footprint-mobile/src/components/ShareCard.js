import { View, Text, StyleSheet } from "react-native";
import COLOURS from "../constants/colours";

export default function shareCard({ stats, username }) {
    const countries = stats?.countries_visited || 0;
    const continents = stats?.continents_visited || 0;
    const worldPercent = stats?.countries_visited 
      ? Math.round((parseInt(stats.countries_visited) / 195) * 100)
      : 0;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.logo}>👣</Text>
                <Text style={styles.appName}>Footprint</Text>
            </View>

            <Text style={styles.username}>@{username || "traveller"}</Text>
            <Text style={styles.tagline}>Building my travel story</Text>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{countries}</Text>
                  <Text style={styles.statLabel}>Countries</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{continents}</Text>
                  <Text style={styles.statLabel}>Continents</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{worldPercent}%</Text>
                  <Text style={styles.statLabel}>Covered</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.footer}>footprint.app</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFDF9",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1.5,
    borderColor: COLOURS.border,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  logo: {
    fontSize: 22,
  },
  appName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLOURS.accent,
    letterSpacing: 0.5,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: COLOURS.textMuted,
    marginBottom: 16,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: COLOURS.border,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLOURS.border,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "800",
    color: COLOURS.accent,
  },
  statLabel: {
    fontSize: 11,
    color: COLOURS.textMuted,
    marginTop: 3,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footer: {
    fontSize: 12,
    color: COLOURS.textMuted,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});