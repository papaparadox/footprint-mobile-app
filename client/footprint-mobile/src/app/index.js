import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Footprint</Text>

      <Link href='/countries' asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>First page</Text>
        </Pressable>
      </Link>

      <Link href='/profile' asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Second pagio</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: "#111",
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
