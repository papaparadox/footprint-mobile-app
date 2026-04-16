import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import COLOURS from "../constants/colours";

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  autoCapitalize = "none",
  keyboardType = "default",
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLOURS.textMuted}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        style={[styles.input, error && styles.inputError]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.accent,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: COLOURS.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOURS.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLOURS.text,
  },
  inputError: {
    borderColor: COLOURS.danger,
    backgroundColor: COLOURS.dangerBg,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: COLOURS.danger,
  },
});
