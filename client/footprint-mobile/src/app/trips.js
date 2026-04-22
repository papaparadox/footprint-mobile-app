import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { getProfile } from "../services/userService";
import { getTripsByUser, createTrip } from "../services/tripService";
import { getAllCountries } from "../services/countryService";

const COLOURS = {
  bg: "#F5F0E8",
  card: "#F0D9B5",
  cardBorder: "#c1a278",
  accent: "#C47B2B",
  accentLight: "#F0D9B5",
  text: "#1C1C1E",
  textSoft: "#6B6055",
  textMuted: "#A89B8C",
  border: "#E2D8CC",
  white: "#FFFFFF",
  danger: "#C0392B",
};

function flagUrl(isoCode) {
  if (!isoCode) return null;
  return `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function formatDateInput(text) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function parseInputDate(str) {
  const match = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const d = new Date(`${match[1]}-${match[2]}-${match[3]}`);
  return isNaN(d.getTime()) ? null : d;
}

export default function TripsPage() {
  const router = useRouter();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [countries, setCountries] = useState([]);
  const [isoMap, setIsoMap] = useState({});

  const [modalVisible, setModalVisible] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const user = await getProfile();
        const [tripsData, countriesData] = await Promise.allSettled([
          getTripsByUser(user.id),
          getAllCountries(),
        ]);

        if (tripsData.status === "fulfilled") setTrips(tripsData.value ?? []);
        if (countriesData.status === "fulfilled") {
          const list = countriesData.value ?? [];
          setCountries(list);
          const map = {};
          list.forEach((c) => {
            map[c.name] = c.iso_code;
          });
          setIsoMap(map);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  function openModal() {
    setSelectedCountry(null);
    setSearch("");
    setStartDate("");
    setEndDate("");
    setDateError("");

    if (countries.length === 0) {
      setLoadingCountries(true);
      getAllCountries()
        .then((data) => {
          const list = data ?? [];
          setCountries(list);
          const map = {};
          list.forEach((c) => {
            map[c.name] = c.iso_code;
          });
          setIsoMap(map);
        })
        .catch(() => {})
        .finally(() => setLoadingCountries(false));
    }

    setModalVisible(true);
  }

  async function handleAddTrip() {
    if (!selectedCountry || creating) return;

    const parsedStart = parseInputDate(startDate);
    const parsedEnd = parseInputDate(endDate);

    if (!parsedStart) {
      setDateError("Enter a valid start date (YYYY-MM-DD).");
      return;
    }
    if (!parsedEnd) {
      setDateError("Enter a valid end date (YYYY-MM-DD).");
      return;
    }
    if (parsedEnd < parsedStart) {
      setDateError("End date must be on or after the start date.");
      return;
    }

    setDateError("");
    setCreating(true);

    try {
      const newTrip = await createTrip({
        title: selectedCountry.name,
        start_date: startDate.trim(),
        end_date: endDate.trim(),
      });
      setTrips((prev) => [newTrip, ...prev]);
      setModalVisible(false);
      router.push(`/trip/${newTrip.id}`);
    } catch {
    } finally {
      setCreating(false);
    }
  }

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size='large' color={COLOURS.accent} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Trips</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openModal}>
            <Text style={styles.addBtnText}>+ Add Trip</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : trips.length === 0 ? (
          <Text style={styles.emptyText}>No trips yet.</Text>
        ) : (
          trips.map((trip) => {
            const iso = isoMap[trip.title];
            const url = flagUrl(iso);
            return (
              <TouchableOpacity
                key={trip.id}
                style={styles.card}
                onPress={() => router.push(`/trip/${trip.id}`)}
                activeOpacity={0.75}
              >
                <View style={styles.cardEmojiWrapper}>
                  {url ? (
                    <Image
                      source={{ uri: url }}
                      style={styles.cardFlag}
                      resizeMode='contain'
                    />
                  ) : (
                    <Text style={styles.cardEmoji}>✈️</Text>
                  )}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{trip.title}</Text>
                  <Text style={styles.cardDate}>
                    {formatDate(trip.start_date)}
                  </Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalScreen}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Latest Trip</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder='Search countries...'
              placeholderTextColor={COLOURS.textMuted}
            />
          </View>

          {loadingCountries ? (
            <View style={styles.centred}>
              <ActivityIndicator size='large' color={COLOURS.accent} />
            </View>
          ) : (
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.countryList}
              keyboardShouldPersistTaps='handled'
              renderItem={({ item }) => {
                const isSelected = selectedCountry?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.countryRow,
                      isSelected && styles.countryRowSelected,
                    ]}
                    onPress={() => setSelectedCountry(item)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: flagUrl(item.iso_code) }}
                      style={styles.flagImage}
                      resizeMode='contain'
                    />
                    <Text
                      style={[
                        styles.countryName,
                        isSelected && styles.countryNameSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && <Text style={styles.countryTick}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <View style={styles.modalFooter}>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Start date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={(t) => setStartDate(formatDateInput(t))}
                  placeholder='YYYY-MM-DD'
                  placeholderTextColor={COLOURS.textMuted}
                  keyboardType='number-pad'
                  maxLength={10}
                />
              </View>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>End date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={(t) => setEndDate(formatDateInput(t))}
                  placeholder='YYYY-MM-DD'
                  placeholderTextColor={COLOURS.textMuted}
                  keyboardType='number-pad'
                  maxLength={10}
                />
              </View>
            </View>

            {!!dateError && <Text style={styles.dateError}>{dateError}</Text>}

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (!selectedCountry || creating) && styles.confirmBtnDisabled,
              ]}
              onPress={handleAddTrip}
              disabled={!selectedCountry || creating}
            >
              {creating ? (
                <ActivityIndicator size='small' color={COLOURS.white} />
              ) : (
                <Text style={styles.confirmBtnText}>
                  {selectedCountry
                    ? `Add Trip to ${selectedCountry.name}`
                    : "Select a country first"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLOURS.bg },
  centred: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOURS.bg,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLOURS.text,
    letterSpacing: 0.2,
  },
  addBtn: {
    backgroundColor: COLOURS.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addBtnText: { fontSize: 13, fontWeight: "700", color: COLOURS.white },
  errorText: {
    fontSize: 13,
    color: COLOURS.danger,
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 13,
    color: COLOURS.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
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
  cardFlag: { width: 38, height: 26, borderRadius: 3 },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 3,
  },
  cardDate: { fontSize: 11, color: COLOURS.textMuted, fontWeight: "500" },
  cardArrow: {
    fontSize: 24,
    color: COLOURS.accent,
    fontWeight: "300",
    marginLeft: 8,
  },

  modalScreen: { flex: 1, backgroundColor: COLOURS.bg },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOURS.border,
    backgroundColor: COLOURS.white,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLOURS.text },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtnText: { fontSize: 14, color: COLOURS.accent, fontWeight: "700" },

  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLOURS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLOURS.border,
  },
  searchInput: {
    backgroundColor: COLOURS.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOURS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLOURS.text,
  },

  countryList: { paddingHorizontal: 16, paddingVertical: 8 },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: COLOURS.white,
    borderWidth: 1,
    borderColor: COLOURS.border,
  },
  countryRowSelected: {
    backgroundColor: COLOURS.accentLight,
    borderColor: COLOURS.accent,
  },
  flagImage: {
    width: 36,
    height: 24,
    borderRadius: 3,
    marginRight: 14,
    backgroundColor: COLOURS.border,
  },
  countryName: { flex: 1, fontSize: 15, color: COLOURS.text },
  countryNameSelected: { fontWeight: "700", color: COLOURS.accent },
  countryTick: { fontSize: 16, color: COLOURS.accent, fontWeight: "700" },

  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLOURS.border,
    backgroundColor: COLOURS.white,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  dateField: { flex: 1 },
  dateLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLOURS.accent,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: COLOURS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLOURS.text,
    backgroundColor: COLOURS.bg,
  },
  dateError: {
    fontSize: 12,
    color: COLOURS.danger,
    marginBottom: 10,
  },
  confirmBtn: {
    backgroundColor: COLOURS.accent,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: 15, fontWeight: "700", color: COLOURS.white },
});
