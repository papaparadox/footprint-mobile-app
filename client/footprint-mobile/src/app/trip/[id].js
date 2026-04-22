import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getTripById, updateTrip, addTripImage } from "../../services/tripService";

const COLOURS = {
  bg: "#F5F0E8",
  card: "#FFFFFF",
  accent: "#C47B2B",
  text: "#1C1C1E",
  textSoft: "#6B6055",
  textMuted: "#A89B8C",
  border: "#E2D8CC",
};

function daysBetween(start, end) {
  if (!start || !end) return "—";
  return Math.round((new Date(end) - new Date(start)) / 86400000);
}

export default function TripDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notesVisible, setNotesVisible] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTripById(id)
      .then((data) => {
        setTrip(data);
        setDraftNotes(data.notes ?? "");
      })
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color={COLOURS.accent} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centred}>
        <Text style={styles.notFoundText}>Trip not found.</Text>
      </View>
    );
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      const updated = await updateTrip(trip.id, { notes: draftNotes });
      setTrip((prev) => ({ ...prev, notes: updated.notes ?? draftNotes }));
      setNotesVisible(false);
    } catch {
      setTrip((prev) => ({ ...prev, notes: draftNotes }));
      setNotesVisible(false);
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleAddPhoto() {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission needed", "Allow photo library access to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setUploadingPhoto(true);
    try {
      const saved = await addTripImage(trip.id, result.assets[0]);
      setTrip((prev) => ({
        ...prev,
        images: [...prev.images, saved],
      }));
    } catch {
      Alert.alert("Upload failed", "Could not upload the photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  const heroImage = trip.images?.[0]?.image_url ?? null;
  const days = daysBetween(trip.start_date, trip.end_date);
  const primaryVisit = trip.visits?.[0];

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrapper}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]} />
          )}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.push("/trips")}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroCountry}>
              {primaryVisit?.country_name ?? trip.title}
            </Text>
            {!!primaryVisit?.continent && (
              <Text style={styles.heroContinent}>{primaryVisit.continent}</Text>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Days Stayed</Text>
            <Text style={styles.statValue}>{days}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Temperature</Text>
            <Text style={styles.statValue}>—</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>{trip.mood ?? "—"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your notes</Text>
        <Text style={styles.notesText}>
          {trip.notes || "No notes added yet."}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setDraftNotes(trip.notes ?? "");
              setNotesVisible(true);
            }}
          >
            <Text style={styles.actionBtnText}>Add Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              uploadingPhoto && styles.actionBtnDisabled,
            ]}
            onPress={handleAddPhoto}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <ActivityIndicator size='small' color={COLOURS.accent} />
            ) : (
              <Text style={styles.actionBtnText}>Add Photo</Text>
            )}
          </TouchableOpacity>
        </View>

        {trip.images.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesRow}
              style={styles.imagesScroll}
            >
              {trip.images.map((img) => (
                <Image
                  key={img.id}
                  source={{ uri: img.image_url }}
                  style={styles.thumbnail}
                  resizeMode='cover'
                />
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.ratingsText}>Ratings {trip.mood ?? "—"}/5</Text>
      </ScrollView>

      <Modal
        visible={notesVisible}
        animationType='slide'
        transparent
        onRequestClose={() => setNotesVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Your Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={draftNotes}
              onChangeText={setDraftNotes}
              multiline
              placeholder='Write about your trip...'
              placeholderTextColor={COLOURS.textMuted}
              autoFocus
              editable
              scrollEnabled
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setNotesVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, savingNotes && { opacity: 0.6 }]}
                onPress={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
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
  notFoundText: { fontSize: 14, color: COLOURS.textMuted },
  scrollContent: { paddingBottom: 48 },

  heroWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: "hidden",
    height: 280,
  },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroPlaceholder: { backgroundColor: COLOURS.heroBg },
  closeBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  heroOverlay: { position: "absolute", bottom: 18, left: 18 },
  heroCountry: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },
  heroContinent: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLOURS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    backgroundColor: COLOURS.card,
  },
  statLabel: {
    fontSize: 10,
    color: COLOURS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  statValue: { fontSize: 18, fontWeight: "700", color: COLOURS.text },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLOURS.text,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: COLOURS.textSoft,
    lineHeight: 22,
    marginHorizontal: 16,
    marginBottom: 24,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 28,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLOURS.accent,
    alignItems: "center",
    backgroundColor: COLOURS.card,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontSize: 13, fontWeight: "600", color: COLOURS.accent },

  imagesScroll: { marginBottom: 24 },
  imagesRow: { paddingHorizontal: 16, gap: 10, paddingVertical: 4 },
  thumbnail: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: COLOURS.border,
  },

  ratingsText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLOURS.text,
    marginHorizontal: 16,
    marginBottom: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLOURS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLOURS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLOURS.text,
    minHeight: 140,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLOURS.border,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: COLOURS.textSoft },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLOURS.accent,
    alignItems: "center",
  },
  modalSaveText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
