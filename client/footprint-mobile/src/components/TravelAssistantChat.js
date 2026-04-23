import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import COLOURS from "../constants/colours";

const QUICK_OPTIONS = [
  { key: "weekend", label: "Weekend" },
  { key: "3-5-days", label: "3–5 Days" },
  { key: "1-week", label: "1 Week" },
  { key: "2-weeks+", label: "2+ Weeks" },
];

export default function TravelAssistantChat({
  messages,
  onSelectDuration,
  onAnotherOption,
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Footprint AI</Text>

      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.sender === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            {message.sender === "ai" ? (
              <Text style={styles.aiLabel}>Footprint AI</Text>
            ) : null}

            <Text
              style={[
                styles.messageText,
                message.sender === "user" && styles.userMessageText,
              ]}
            >
              {message.text}
            </Text>

            {message.suggestion ? (
              <View style={styles.suggestionCard}>
                <Text style={styles.suggestionTitle}>
                  {message.suggestion.city}, {message.suggestion.destination}
                </Text>

                <Text style={styles.suggestionMeta}>
                  {message.suggestion.duration} · {message.suggestion.budget}
                </Text>

                <Text style={styles.suggestionReason}>
                  {message.suggestion.reason}
                </Text>

                <View style={styles.tagsWrap}>
                  {message.suggestion.tags?.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <Pressable onPress={onAnotherOption}>
                  <Text style={styles.altLink}>Give me another option</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.quickReplyWrap}>
        {QUICK_OPTIONS.map((item) => (
          <Pressable
            key={item.key}
            style={styles.quickReply}
            onPress={() => onSelectDuration(item)}
          >
            <Text style={styles.quickReplyText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLOURS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOURS.border,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOURS.text,
    marginBottom: 12,
  },
  chatArea: {
    maxHeight: 360,
  },
  chatContent: {
    gap: 10,
    paddingBottom: 8,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 16,
    padding: 12,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF8F0",
    borderWidth: 1,
    borderColor: "#F1D6B7",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLOURS.accent,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLOURS.accent,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLOURS.text,
  },
  userMessageText: {
    color: "#fff",
    fontWeight: "600",
  },
  suggestionCard: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLOURS.border,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLOURS.text,
    marginBottom: 4,
  },
  suggestionMeta: {
    fontSize: 12,
    color: COLOURS.textSoft,
    marginBottom: 8,
  },
  suggestionReason: {
    fontSize: 12,
    color: COLOURS.textSoft,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: COLOURS.accentLight,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLOURS.accent,
  },
  altLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.accent,
  },
  quickReplyWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  quickReply: {
    backgroundColor: COLOURS.accentLight,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLOURS.accent,
  },
});
