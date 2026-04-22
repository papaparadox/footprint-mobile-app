import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Link } from "expo-router";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import COLOURS from "../constants/colours";
import User from "../models/User";
import { registerUser } from "../services/authService";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    home_country: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.username.trim()) {
      nextErrors.username = "Username is required.";
    } else if (form.username.trim().length < 3) {
      nextErrors.username = "Username must be at least 3 characters.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!validateEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!form.home_country.trim()) {
      nextErrors.home_country = "Home country is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleRegister() {
    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    const newUser = new User(
      null,
      form.username.trim(),
      form.email.trim(),
      form.password,
      form.home_country.trim(),
    );

    try {
      setLoading(true);

      const data = await registerUser(newUser);

      setSuccessMessage("Account created successfully.");
      console.log("Register response:", data);
      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Footprint</Text>
        <Text style={styles.heroTitle}>Start your journey</Text>
        <Text style={styles.heroSubtitle}>
          Create your account and begin building your Footprint.
        </Text>
      </View>

      <View style={styles.formCard}>
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
          onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
          placeholder="maya@example.com"
          keyboardType="email-address"
          error={errors.email}
        />

        <FormInput
          label="Password"
          value={form.password}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, password: text }))
          }
          placeholder="At least 6 characters"
          secureTextEntry
          error={errors.password}
        />

        <FormInput
          label="Home Country"
          value={form.home_country}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, home_country: text }))
          }
          placeholder="United Kingdom"
          autoCapitalize="words"
          error={errors.home_country}
        />

        {serverError ? (
          <Text style={styles.serverError}>{serverError}</Text>
        ) : null}

        {successMessage ? (
          <Text style={styles.successMessage}>{successMessage}</Text>
        ) : null}

        <PrimaryButton
          label={loading ? "Creating Account..." : "Create Account"}
          onPress={handleRegister}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <Text style={styles.loginLink}>Log in</Text>
          </Link>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  heroCard: {
    marginTop: 22,
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
  serverError: {
    marginBottom: 12,
    fontSize: 12,
    color: COLOURS.danger,
  },
  successMessage: {
    marginBottom: 12,
    fontSize: 12,
    color: COLOURS.accent,
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: COLOURS.textSoft,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: "700",
    color: COLOURS.accent,
  },
});
