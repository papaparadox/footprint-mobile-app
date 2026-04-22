import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import COLOURS from "../constants/colours";

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLOURS.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: COLOURS.textSoft,
    marginBottom: 4,
  },

  input: {
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: COLOURS.card,
    borderWidth: 1,
    borderColor: COLOURS.border,
  },

  inputError: {
    borderColor: COLOURS.danger,
  },

  error: {
    marginTop: 2,
    fontSize: 10,
    color: COLOURS.danger,
  },
});
