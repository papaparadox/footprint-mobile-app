import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { router } from "expo-router";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import COLOURS from "../constants/colours";

export default function EditProfileScreen() {
  const [form, setForm] = useState({
    username: "maya_reyes",
    email: "maya@example.com",
    home_country: "Spain",
    bio: "Nomadic soul on the lookout for serene spots, rich cultures and luxurious hideaways.",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.username.trim()) {
      nextErrors.username = "Username is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!validateEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.home_country.trim()) {
      nextErrors.home_country = "Home country is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    setSuccessMessage("");

    if (!validateForm()) return;

    console.log("Updated profile:", form);
    setSuccessMessage("Profile updated successfully.");
  }

  function handleCancel() {
    router.back();
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Profile</Text>
        <Text style={styles.heroTitle}>Edit your details</Text>
        <Text style={styles.heroSubtitle}>
          Keep your travel identity up to date.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>📷</Text>
            </View>
          </View>

          <Pressable style={styles.photoButton}>
            <Text style={styles.photoButtonText}>Change Photo</Text>
          </Pressable>
        </View>

        <FormInput
          label="Username"
          value={form.username}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, username: text }))
          }
          placeholder="maya_reyes"
          error={errors.username}
        />

        <FormInput
          label="Email"
          value={form.email}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, email: text }))
          }
          placeholder="maya@example.com"
          keyboardType="email-address"
          error={errors.email}
        />

        <FormInput
          label="Home Country"
          value={form.home_country}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, home_country: text }))
          }
          placeholder="Spain"
          autoCapitalize="words"
          error={errors.home_country}
        />

        <View style={styles.bioGroup}>
          <Text style={styles.bioLabel}>Bio</Text>
          <View style={styles.bioInput}>
            <Text
              style={styles.bioText}
              onPress={() => {}}
            >
              {form.bio}
            </Text>
          </View>
        </View>

        {successMessage ? (
          <Text style={styles.successMessage}>{successMessage}</Text>
        ) : null}

        <PrimaryButton label="Save Changes" onPress={handleSave} />

        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

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
  heroCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: COLOURS.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLOURS.textSoft,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOURS.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2.5,
    borderColor: COLOURS.accent,
    padding: 4,
    backgroundColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLOURS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: {
    fontSize: 28,
  },
  photoButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLOURS.accentLight,
  },
  photoButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLOURS.accent,
  },
  bioGroup: {
    marginBottom: 14,
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.accent,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  bioInput: {
    minHeight: 110,
    backgroundColor: COLOURS.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOURS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bioText: {
    fontSize: 14,
    color: COLOURS.text,
    lineHeight: 20,
  },
  successMessage: {
    marginBottom: 12,
    fontSize: 12,
    color: COLOURS.accent,
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLOURS.textSoft,
  },
});