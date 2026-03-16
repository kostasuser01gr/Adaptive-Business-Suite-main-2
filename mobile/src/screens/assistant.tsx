import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { AppButton, AppInput, Chip, Panel, Screen, SectionHeader, StatusBadge } from "../components/ui";
import { theme } from "../app/theme";
import { useAppStore } from "../state/store";
import { useActiveWorkspace } from "../state/selectors";

export function AssistantScreen() {
  const workspace = useActiveWorkspace();
  const assistantMessages = useAppStore((state) =>
    state.assistantMessages.filter((message) => message.workspaceId === workspace?.id || message.workspaceId === null),
  );
  const assistantSuggestions = useAppStore((state) =>
    state.assistantSuggestions.filter((suggestion) => suggestion.workspaceId === workspace?.id || suggestion.workspaceId === null),
  );
  const modelSettings = useAppStore((state) => state.modelSettings);
  const sendAssistantCommand = useAppStore((state) => state.sendAssistantCommand);
  const applySuggestion = useAppStore((state) => state.applySuggestion);
  const dismissSuggestion = useAppStore((state) => state.dismissSuggestion);
  const [command, setCommand] = useState("");

  const prompts = [
    "Add a Damage Reports module",
    "Add a quick button for New Booking",
    "Switch this workspace to personal mode",
    "Summarize workspace state",
  ];

  if (!workspace) return null;

  return (
    <Screen>
      <SectionHeader title="Assistant" subtitle="The intelligence layer lives inside the product, not beside it." />
      <Panel>
        <Text style={{ color: theme.colors.text, fontWeight: "700" }}>Model routing</Text>
        <Text style={{ color: theme.colors.textMuted }}>
          Provider: {modelSettings.activeProvider} · {modelSettings.activeModelLabel}
        </Text>
        <StatusBadge label={modelSettings.fallbackModeEnabled ? "Fallback mode enabled" : "Live adapter slot"} tone="info" />
      </Panel>

      <Panel>
        <AppInput value={command} onChangeText={setCommand} placeholder="Ask the assistant to change or summarize something..." multiline />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            {prompts.map((prompt) => (
              <Chip key={prompt} label={prompt} onPress={() => setCommand(prompt)} />
            ))}
          </View>
        </ScrollView>
        <AppButton
          label="Send"
          icon="sparkles"
          onPress={async () => {
            if (!command.trim()) return;
            await sendAssistantCommand(command.trim());
            setCommand("");
          }}
        />
      </Panel>

      <SectionHeader title="Pending suggestions" subtitle="Every change goes through proposal, preview, and apply." />
      {assistantSuggestions.filter((suggestion) => suggestion.status === "pending").length === 0 ? (
        <Panel>
          <Text style={{ color: theme.colors.textMuted }}>No pending suggestions right now.</Text>
        </Panel>
      ) : (
        assistantSuggestions
          .filter((suggestion) => suggestion.status === "pending")
          .map((suggestion) => (
            <Panel key={suggestion.id}>
              <Text style={{ color: theme.colors.text, fontWeight: "700" }}>{suggestion.title}</Text>
              <Text style={{ color: theme.colors.textMuted }}>{suggestion.description}</Text>
              {suggestion.preview.map((line) => (
                <Text key={line} style={{ color: theme.colors.text }}>
                  • {line}
                </Text>
              ))}
              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <AppButton label="Apply" onPress={() => applySuggestion(suggestion.id)} style={{ flex: 1 }} />
                <AppButton label="Dismiss" variant="secondary" onPress={() => dismissSuggestion(suggestion.id)} style={{ flex: 1 }} />
              </View>
            </Panel>
          ))
      )}

      <SectionHeader title="Conversation" subtitle="Deterministic replies now, pluggable model adapters later." />
      {assistantMessages.map((message) => (
        <Panel key={message.id} style={{ backgroundColor: message.role === "assistant" ? theme.colors.surface : theme.colors.surfaceAlt }}>
          <Text style={{ color: message.role === "assistant" ? theme.colors.primary : theme.colors.textMuted, fontWeight: "700" }}>
            {message.role === "assistant" ? "Assistant" : "You"}
          </Text>
          <Text style={{ color: theme.colors.text, lineHeight: 20 }}>{message.content}</Text>
        </Panel>
      ))}
    </Screen>
  );
}
