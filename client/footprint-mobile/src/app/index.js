
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Link } from "expo-router";

export default function HomePage() {
  return (
    <View style={styles.screen}>
      <ImageBackground
        source={{
          uri: "https://images.pexels.com/photos/19137171/pexels-photo-19137171.jpeg?cs=srgb&dl=pexels-joe-fikar-799933673-19137171.jpg&fm=jpg",
        }}
        style={styles.heroCard}
        imageStyle={styles.heroImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.logo}>👣</Text>

          <View style={styles.textContainer}>
            <Text style={styles.title}>EXPLORE</Text>
            <Text style={styles.title}>YOUR</Text>
            <Text style={styles.title}>JOURNEY</Text>
          </View>

          <View style={styles.buttonGroup}>
            <Link href="/countries" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Start Now</Text>
              </Pressable>
            </Link>

            <View style={styles.secondaryButtons}>
              <Link href="/countries" asChild>
                <Pressable style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Countries</Text>
                </Pressable>
              </Link>

              <Link href="/profile" asChild>
                <Pressable style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Profile</Text>
                </Pressable>
              </Link>
              <Link href="/trips" asChild>
                <Pressable style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Trips</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#e5e5e5",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  heroCard: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroImage: {
    borderRadius: 40,
  },
  overlay: {
    flex: 1,
    borderRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 28,
    textAlign: "center",
    color: "#fff",
    marginTop: 4,
  },
  textContainer: {
    marginTop: 120,
  },
  title: {
    fontSize: 50,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 56,
    letterSpacing: 1,
  },
  buttonGroup: {
    gap: 14,
  },
  primaryButton: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    color: "#222",
    fontWeight: "500",
  },
  secondaryButtons: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 17,
    color: "#222",
    fontWeight: "500",
  },
});