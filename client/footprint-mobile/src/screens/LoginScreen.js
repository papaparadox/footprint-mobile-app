import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import COLOURS from "../constants/colours";
import { loginUser } from "../services/authService";

export default function LoginScreen() {
  const [form, setForm] = useState({
    email: "",
    password: "",
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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLogin() {
    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = await loginUser(form.email.trim(), form.password);

      setSuccessMessage("Login successful.");
      console.log("Login response:", data);

      router.replace("countries");
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
        <Text style={styles.heroTitle}>Welcome back</Text>
        <Text style={styles.heroSubtitle}>
          Log in to continue tracking your travel story.
        </Text>
      </View>

      <View style={styles.formCard}>
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
          placeholder="Enter password"
          secureTextEntry
          error={errors.password}
        />

        {serverError ? (
          <Text style={styles.serverError}>{serverError}</Text>
        ) : null}

        {successMessage ? (
          <Text style={styles.successMessage}>{successMessage}</Text>
        ) : null}

        <PrimaryButton
          label={loading ? "Logging In..." : "Log In"}
          onPress={handleLogin}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <Link href="/registration" asChild>
            <Text style={styles.registerLink}>Register</Text>
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
  registerLink: {
    fontSize: 13,
    fontWeight: "700",
    color: COLOURS.accent,
  },
});
