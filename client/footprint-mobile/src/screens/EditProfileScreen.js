import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import COLOURS from "../constants/colours";
import { updateProfile, getProfile } from "../services/userService";

export default function EditProfileScreen() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 380 || height < 760;

  const [form, setForm] = useState({
    username: "",
    email: "",
    home_country: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [originalProfile, setOriginalProfile] = useState({
    username: "",
    email: "",
    home_country: "",
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();

        const profileData = {
          username: data.username || "",
          email: data.email || "",
          home_country: data.home_country || "",
        };

        setForm((prev) => ({
          ...prev,
          ...profileData,
        }));

        setOriginalProfile(profileData);
      } catch (error) {
        setServerError(error.message);
      } finally {
        setInitialLoading(false);
      }
    }

    loadProfile();
  }, []);

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

    const isTryingToChangePassword =
      form.currentPassword || form.newPassword || form.confirmPassword;

    if (isTryingToChangePassword) {
      if (!form.currentPassword.trim()) {
        nextErrors.currentPassword = "Current password is required.";
      }

      if (!form.newPassword.trim()) {
        nextErrors.newPassword = "New password is required.";
      } else if (form.newPassword.length < 6) {
        nextErrors.newPassword = "New password must be at least 6 characters.";
      }

      if (!form.confirmPassword.trim()) {
        nextErrors.confirmPassword = "Please confirm your new password.";
      } else if (form.newPassword !== form.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    setSuccessMessage("");
    setServerError("");

    if (!validateForm()) return;

    const payload = {};

    if (form.username.trim() !== originalProfile.username) {
      payload.username = form.username.trim();
    }

    if (form.email.trim() !== originalProfile.email) {
      payload.email = form.email.trim();
    }

    if (form.home_country.trim() !== originalProfile.home_country) {
      payload.home_country = form.home_country.trim();
    }

    if (form.newPassword.trim()) {
      payload.password = form.newPassword.trim();
    }

    if (Object.keys(payload).length === 0) {
      setServerError("No changes to save.");
      return;
    }

    try {
      setLoading(true);
      await updateProfile(payload);

      setSuccessMessage("Profile updated successfully.");

      const updatedProfile = {
        username: payload.username ?? originalProfile.username,
        email: payload.email ?? originalProfile.email,
        home_country: payload.home_country ?? originalProfile.home_country,
      };

      setOriginalProfile(updatedProfile);

      setForm((prev) => ({
        ...prev,
        ...updatedProfile,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setTimeout(() => {
        router.replace("/profile");
      }, 700);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.replace("/profile");
  }

  function handleChangePhoto() {
    console.log("Open image picker here");
  }

  if (initialLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLOURS.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: isSmallScreen ? 12 : 16,
          paddingTop: isSmallScreen ? 12 : 18,
          paddingBottom: isSmallScreen ? 16 : 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.shell}>
        <View style={styles.heroCard}>
          <Pressable style={styles.simpleBackRow} onPress={handleCancel}>
            <Text style={styles.simpleBackText}>← Back</Text>
          </Pressable>

          <Text style={styles.heroEyebrow}>Profile Studio</Text>
          <Text
            style={[
              styles.heroTitle,
              {
                fontSize: isSmallScreen ? 21 : 24,
                lineHeight: isSmallScreen ? 27 : 30,
              },
            ]}
          >
            Edit your details
          </Text>
          <Text style={styles.heroSubtitle}>
            Update your essentials and keep your profile current.
          </Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.avatarSectionCompact}>
            <View style={styles.avatarRowCompact}>
              <View style={styles.avatarRingCompact}>
                <View style={styles.avatarPlaceholderCompact}>
                  <Text style={styles.avatarEmojiCompact}>👤</Text>
                </View>
              </View>

              <View style={styles.avatarInfoCompact}>
                <Text style={styles.avatarTitleCompact}>Profile Photo</Text>
                <Text style={styles.avatarSubtitleCompact}>
                  Keep it simple and recognisable
                </Text>
              </View>

              <Pressable
                style={styles.photoIconButton}
                onPress={handleChangePhoto}
              >
                <Text style={styles.photoIcon}>📷</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>Essentials</Text>
              <Text style={styles.sectionTitle}>Personal details</Text>
            </View>

            <View style={styles.compactGrid}>
              <View style={styles.gridItem}>
                <FormInput
                  label="Username"
                  value={form.username}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, username: text }))
                  }
                  placeholder="maya_reyes"
                  error={errors.username}
                />
              </View>

              <View style={styles.gridItem}>
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
              </View>
            </View>

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
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>Security</Text>
              <Text style={styles.sectionTitle}>Password update</Text>
              <Text style={styles.sectionHint}>
                Leave blank if you do not want to change your password.
              </Text>
            </View>

            <View style={styles.compactGrid}>
              <View style={styles.gridItem}>
                <FormInput
                  label="Current Password"
                  value={form.currentPassword}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, currentPassword: text }))
                  }
                  placeholder="Current password"
                  secureTextEntry
                  error={errors.currentPassword}
                />
              </View>

              <View style={styles.gridItem}>
                <FormInput
                  label="New Password"
                  value={form.newPassword}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, newPassword: text }))
                  }
                  placeholder="New password"
                  secureTextEntry
                  error={errors.newPassword}
                />
              </View>
            </View>

            <FormInput
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, confirmPassword: text }))
              }
              placeholder="Confirm password"
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          {serverError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <View style={styles.bottomActions}>
            <View style={styles.primaryActionWrap}>
              <PrimaryButton
                label={loading ? "Saving..." : "Save Changes"}
                onPress={handleSave}
              />
            </View>

            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOURS.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOURS.bg,
  },
  scrollContent: {
    minHeight: "100%",
  },
  shell: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  heroCard: {
    marginTop: 22,
    backgroundColor: COLOURS.card,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  simpleBackRow: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  simpleBackText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLOURS.accent,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: COLOURS.accent,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    fontWeight: "800",
    color: COLOURS.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLOURS.textSoft,
  },
  mainCard: {
    backgroundColor: COLOURS.card,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: COLOURS.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarSectionCompact: {
    marginBottom: 8,
  },
  avatarRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF9F3",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#F0E2D1",
  },
  avatarRingCompact: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLOURS.accent,
    backgroundColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
  },
  avatarPlaceholderCompact: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLOURS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmojiCompact: {
    fontSize: 20,
  },
  avatarInfoCompact: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  avatarTitleCompact: {
    fontSize: 14,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 2,
  },
  avatarSubtitleCompact: {
    fontSize: 11,
    color: COLOURS.textSoft,
  },
  photoIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF4E7",
    borderWidth: 1,
    borderColor: COLOURS.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  photoIcon: {
    fontSize: 16,
  },
  sectionCard: {
    backgroundColor: "#FFF9F3",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#F0E2D1",
    marginBottom: 8,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    color: COLOURS.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 2,
  },
  sectionHint: {
    fontSize: 10,
    lineHeight: 15,
    color: COLOURS.textSoft,
  },
  compactGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  gridItem: {
    flex: 1,
    minWidth: 140,
  },
  errorBox: {
    backgroundColor: "#FDECEC",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 2,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLOURS.danger,
  },
  successBox: {
    backgroundColor: "#FFF4E7",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 2,
    marginBottom: 6,
  },
  successText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLOURS.accent,
    fontWeight: "600",
  },
  bottomActions: {
    marginTop: 2,
  },
  primaryActionWrap: {
    marginBottom: 4,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.textSoft,
  },
});
