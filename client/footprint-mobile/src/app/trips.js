import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

const COLOURS = {
  bg: "#F5F0E8",
  card: "#F0D9B5",
  cardBorder: "#c1a278",
  accent: "#C47B2B",
  text: "#1C1C1E",
  textSoft: "#6B6055",
  textMuted: "#A89B8C",
};

const TRIPS = [
  {
    id: "1",
    title: "Trip 1",
    country: "Japan",
    city: "Tokyo",
    date: "Mar 2025",
    emoji: "🗼", // will be used for the trip image
  },
  {
    id: "2",
    title: "Trip 2",
    country: "Portugal",
    city: "Lisbon",
    date: "Aug 2024",
    emoji: "🌊",
  },
];

export default function TripsPage() {
  const router = useRouter();

  const handleTripPress = (trip) => {
    router.push(`/trip/${trip.id}`);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Trips</Text>
      {TRIPS.map((trip) => (
        <TouchableOpacity
          key={trip.id}
          style={styles.card}
          onPress={() => handleTripPress(trip)}
          activeOpacity={0.75}
        >
          <View style={styles.cardEmojiWrapper}>
            <Text style={styles.cardEmoji}>{trip.emoji}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{trip.title}</Text>
            <Text style={styles.cardDestination}>
              {trip.city}, {trip.country}
            </Text>
            <Text style={styles.cardDate}>{trip.date}</Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLOURS.bg },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLOURS.text,
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOURS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOURS.cardBorder,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },
  cardEmojiWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLOURS.cardBorder,
  },
  cardEmoji: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 3,
  },
  cardDestination: { fontSize: 13, color: COLOURS.textSoft, marginBottom: 2 },
  cardDate: { fontSize: 11, color: COLOURS.textMuted, fontWeight: "500" },
  cardArrow: {
    fontSize: 24,
    color: COLOURS.accent,
    fontWeight: "300",
    marginLeft: 8,
  },
});
