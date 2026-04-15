import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

const USER = {
  name: "Maya Reyes",
  avatar: null, // replace with { uri: '...' }
  about:
    "Nomadic soul on the lookout for serene sports, rich cultures and luxurious hideaways.",
  countries: 12,
  cities: 28,
  trips: 8,
  worldExplored: 8,
  level: 3,
  levelLabel: "Explorer",
  levelProgress: 0.7,
};

const TRIPS = [
  { id: 1, title: "Landmark Hunter" },
  { id: 2, title: "Landmark Hunter" },
  { id: 3, title: "Landmark Hunter" },
];

const MEMORIES = [null, null, null];

function Avatar({ source }) {
  return (
    <View style={styles.avatarWrapper}>
      <View style={styles.avatarRing}>
        {source ? (
          <Image source={source} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>Pic</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function StatPill({ emoji, value, label }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}> {label}</Text>
    </View>
  );
}

function WorldCoverageCard({ percent }) {
  return (
    <View style={styles.coverageCard}>
      <View style={styles.coverageHeader}>
        <Text style={styles.coverageEmoji}>🌐</Text>
        <Text style={styles.coverageTitle}>World Coverage</Text>
      </View>
      <View style={styles.miniMapPlaceholder}>
        <Text style={styles.miniMap}>[ Mini Map Card ]</Text>
      </View>
      <Text style={styles.coveragePercent}>
        {percent}% of the world explored
      </Text>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

function TripCard({ title }) {
  return (
    <View style={styles.tripCard}>
      <View style={styles.tripImagePlaceholder}>
        <Text style={styles.tripImageEmoji}>🏯</Text>
      </View>
      <View style={styles.tripLabelBanner}>
        <Text style={styles.tripLabelText}>{title}</Text>
      </View>
    </View>
  );
}
export default function ProfilePage() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Avatar source={USER.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{USER.name}</Text>
          <Text style={styles.headerAboutLabel}>About</Text>
          <Text style={styles.headerAbout}>{USER.about}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatPill emoji='🌍' value={USER.countries} label='Countries' />
        <StatPill emoji='📊' value={USER.cities} label='Cities' />
        <StatPill emoji='✈️' value={USER.trips} label='Trips' />
      </View>

      <WorldCoverageCard percent={USER.worldExplored} />

      <Text style={styles.sectionTitle}>Featured Trips</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tripsRow}
      >
        {TRIPS.map((trip) => (
          <TripCard key={trip.id} title={trip.title} />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const COLOURS = {
  bg: "#F5F0E8",
  card: "#FFFFFF",
  accent: "#C47B2B",
  accentLight: "#F0D9B5",
  text: "#1C1C1E",
  textSoft: "#6B6055",
  textMuted: "#A89B8C",
  progressBg: "#E4D8C8",
  tripBg: "#2D4A3E",
  border: "#E2D8CC",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOURS.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
    gap: 16,
  },
  avatarWrapper: {
    flexShrink: 0,
  },
  avatarRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2.5,
    borderColor: COLOURS.accent,
    padding: 3,
    backgroundColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },

  headerInfo: {
    flex: 1,
    paddingTop: 4,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 2,
  },
  headerAboutLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
    color: COLOURS.accent,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerAbout: {
    fontSize: 13,
    color: COLOURS.textSoft,
    lineHeight: 19,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 8,
  },
  statPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOURS.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLOURS.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statEmoji: {
    fontSize: 14,
    marginRight: 4,
  },

  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLOURS.textMuted,
  },
  coverageCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLOURS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  coverageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  coverageEmoji: { fontSize: 18 },
  coverageTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLOURS.text,
  },
  miniMapPlaceholder: {
    height: 64,
    backgroundColor: COLOURS.accentLight,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLOURS.border,
  },
  miniMap: {
    fontSize: 12,
    color: COLOURS.textMuted,
    fontStyle: "italic",
  },
  coveragePercent: {
    fontSize: 12,
    color: COLOURS.textSoft,
    fontStyle: "italic",
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: COLOURS.progressBg,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLOURS.accent,
    borderRadius: 4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  tripsRow: {
    gap: 12,
    paddingRight: 4,
    marginBottom: 24,
  },
  tripCard: {
    width: 122,
    height: 120,
    borderRadius: 14,
    backgroundColor: COLOURS.tripBg,
    overflow: "hidden",
    elevation: 3,
  },
  tripImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  tripImageEmoji: {
    fontSize: 48,
    opacity: 0.85,
  },
  tripLabelBanner: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tripLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  memoriesGrid: {
    flexDirection: "row",
    gap: 10,
  },
  memoryCard: {
    flex: 1,
    height: 90,
    backgroundColor: COLOURS.border,
    borderRadius: 12,
  },
});
