import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import COLOURS from "../constants/colours";

export default function PrimaryButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 6,
    backgroundColor: COLOURS.accent,
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
