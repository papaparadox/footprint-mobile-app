import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import GlobeView from "../components/GlobeView";
import { getToken } from "../services/tokenService";

const API_BASE_URL = "https://footprint-mobile-app.onrender.com";

export default function CountriesPage() {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const token = await getToken();
        console.log("TOKEN:", token);
        console.log("URL:", `${API_BASE_URL}/country`);

        if (!token) {
          console.log("No token found");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/country`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("COUNTRY STATUS:", response.status);

        const text = await response.text();
        console.log("COUNTRY RESPONSE:", text);

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }

        const data = JSON.parse(text);
        setAllCountries(data);
      } catch (error) {
        console.log("Fetch countries error:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleGlobeMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "country-click") {
        setSelectedCountries((current) =>
          current.includes(data.name)
            ? current.filter((country) => country !== data.name)
            : [...current, data.name]
        );
      }
    } catch (error) {
      console.log("Message parse error:", error);
    }
  };

  const handleSaveCountries = async () => {
    try {
      setIsSaving(true);

      const token = await getToken();

      if (!token) {
        Alert.alert("Not logged in", "Please log in first.");
        return;
      }

      if (allCountries.length === 0) {
        Alert.alert("Error", "Countries not loaded yet.");
        return;
      }

      const uniqueSelectedCountries = [...new Set(selectedCountries)];

      const matchedCountries = uniqueSelectedCountries
        .map((selectedName) =>
          allCountries.find((country) => country.name === selectedName)
        )
        .filter(Boolean);

      if (matchedCountries.length === 0) {
        Alert.alert("Error", "No valid countries selected.");
        return;
      }

      const failedCountries = [];

      for (const country of matchedCountries) {
        // const response = await fetch(`${API_BASE_URL}/visited`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${token}`,
        //   },
        //   body: JSON.stringify({
        //     country_id: country.id,
        //   }),
        // });
        const response = await fetch(`${API_BASE_URL}/country`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();
console.log("COUNTRY STATUS:", response.status);
console.log("COUNTRY RESPONSE:", data);

if (!response.ok) {
  throw new Error(data.error || `Failed with status ${response.status}`);
}

setAllCountries(data);

        if (!response.ok) {
          failedCountries.push(country.name);
        }
      }

      if (failedCountries.length > 0) {
        Alert.alert("Some failed", failedCountries.join(", "));
        return;
      }

      Alert.alert("Success", "Countries saved!", [
        {
          text: "OK",
          onPress: () => router.push("/profile"),
        },
      ]);
    } catch (error) {
      console.log("Save error:", error);
      Alert.alert("Error", "Failed to save countries.");
    } finally {
      setIsSaving(false);
    }
  };

  const previewCountries = selectedCountries.slice(0, 6);
  const remainingCount = selectedCountries.length - previewCountries.length;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Explore the World</Text>
        <Text style={styles.subtitle}>
          Select the countries you’ve visited
        </Text>

        <GlobeView
          onMessage={handleGlobeMessage}
          selectedCountries={selectedCountries}
        />

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>
            Countries selected ({selectedCountries.length})
          </Text>

          {selectedCountries.length === 0 ? (
            <Text style={styles.emptyText}>No countries selected yet</Text>
          ) : (
            <View style={styles.pillContainer}>
              {previewCountries.map((country) => (
                <View key={country} style={styles.pill}>
                  <Text style={styles.pillText}>{country}</Text>
                </View>
              ))}

              {remainingCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>+{remainingCount} more</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Pressable
          style={[
            styles.saveButton,
            (selectedCountries.length === 0 || isSaving) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSaveCountries}
          disabled={selectedCountries.length === 0 || isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save to Travel Log"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 140,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  listSection: {
    marginTop: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  emptyText: {
    color: "#6b7280",
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    backgroundColor: "#DCEFE2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillText: {
    color: "#1F5F3B",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#2E8B57",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
