// import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
// import { useState } from "react";
// import { useRouter } from "expo-router";
// import GlobeView from "../components/GlobeView";


// export default function CountriesPage() {
//   const [selectedCountries, setSelectedCountries] = useState([]);
//   const router = useRouter();

//   const handleGlobeMessage = (event) => {
//     try {
//       const data = JSON.parse(event.nativeEvent.data);

//       if (data.type === "country-click") {
//         setSelectedCountries((current) =>
//           current.includes(data.name)
//             ? current.filter((country) => country !== data.name)
//             : [...current, data.name]
//         );
//       }

//       if (data.type === "globe-error") {
//         console.log("Globe error:", data.message);
//       }
//     } catch (error) {
//       console.log("Message parse error:", error);
//     }
//   };

//   const handleSaveCountries = () => {
//     console.log("Sending to backend:", selectedCountries);

//     Alert.alert("Saved", "Countries saved to your travel log!", [
//       {
//         text: "OK",
//         onPress: () => router.push("/profile"),
//       },
//     ]);
//   };

//   const previewCountries = selectedCountries.slice(0, 6);
//   const remainingCount = selectedCountries.length - previewCountries.length;

//   return (
//     <View style={styles.screen}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={styles.title}>Explore the World</Text>
//         <Text style={styles.subtitle}>Select the countries you’ve visited</Text>

//         <GlobeView
//           onMessage={handleGlobeMessage}
//           selectedCountries={selectedCountries}
//         />

//         <View style={styles.listSection}>
//           <Text style={styles.listTitle}>
//             Countries ready to save ({selectedCountries.length})
//           </Text>

//           {selectedCountries.length === 0 ? (
//             <Text style={styles.emptyText}>No countries selected yet</Text>
//           ) : (
//             <View style={styles.pillContainer}>
//               {previewCountries.map((country) => (
//                 <View key={country} style={styles.pill}>
//                   <Text style={styles.pillText}>{country}</Text>
//                 </View>
//               ))}

//               {remainingCount > 0 && (
//                 <View style={styles.pill}>
//                   <Text style={styles.pillText}>+{remainingCount} more</Text>
//                 </View>
//               )}
//             </View>
//           )}
//         </View>

//         <Pressable
//           style={[
//             styles.saveButton,
//             selectedCountries.length === 0 && styles.saveButtonDisabled,
//           ]}
//           onPress={handleSaveCountries}
//           disabled={selectedCountries.length === 0}
//         >
//           <Text style={styles.saveButtonText}>Save to Travel Log</Text>
//         </Pressable>
//       </ScrollView>

//       {/* <Navbar /> */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: "#f3f4f6",
//   },
//   container: {
//     padding: 20,
//     paddingBottom: 140,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   subtitle: {
//     fontSize: 15,
//     color: "#6b7280",
//     marginBottom: 20,
//   },
//   listSection: {
//     marginTop: 20,
//   },
//   listTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 10,
//     color: "#111827",
//   },
//   emptyText: {
//     color: "#6b7280",
//   },
//   pillContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },
//   pill: {
//     backgroundColor: "#DCEFE2",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 999,
//   },
//   pillText: {
//     color: "#1F5F3B",
//     fontWeight: "600",
//   },
//   saveButton: {
//     marginTop: 20,
//     backgroundColor: "#2E8B57",
//     paddingVertical: 14,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   saveButtonDisabled: {
//     backgroundColor: "#9CA3AF",
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
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
        const response = await fetch(`${API_BASE_URL}/country/`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to fetch countries");
        }

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

      if (data.type === "globe-error") {
        console.log("Globe error:", data.message);
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
        Alert.alert("Not logged in", "Please log in before saving countries.");
        return;
      }

      const uniqueSelectedCountries = [...new Set(selectedCountries)];

      const matchedCountries = uniqueSelectedCountries
        .map((selectedName) =>
          allCountries.find((country) => country.name === selectedName)
        )
        .filter(Boolean);

      if (matchedCountries.length === 0) {
        Alert.alert("No valid countries", "No matching countries were found.");
        return;
      }

      for (const country of matchedCountries) {
        const response = await fetch(`${API_BASE_URL}/visited/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            country_id: country.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.log("Save country failed:", country.name, data);
        }
      }

      Alert.alert("Saved", "Countries saved to your travel log!", [
        {
          text: "OK",
          onPress: () => router.push("/profile"),
        },
      ]);
    } catch (error) {
      console.log("API error:", error);
      Alert.alert("Save failed", "Something went wrong while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const previewCountries = selectedCountries.slice(0, 6);
  const remainingCount = selectedCountries.length - previewCountries.length;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Explore the World</Text>
        <Text style={styles.subtitle}>Select the countries you’ve visited</Text>

        <GlobeView
          onMessage={handleGlobeMessage}
          selectedCountries={selectedCountries}
        />

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>
            Countries ready to save ({selectedCountries.length})
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
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 20,
    paddingBottom: 140,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 20,
  },
  listSection: {
    marginTop: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111827",
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
    marginTop: 20,
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