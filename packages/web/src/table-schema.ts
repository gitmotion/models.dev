export type ColumnType = "text" | "number" | "boolean" | "modalities";

export type ColumnKey =
  | "provider"
  | "model"
  | "family"
  | "providerId"
  | "modelId"
  | "toolCall"
  | "reasoning"
  | "modalitiesInput"
  | "modalitiesOutput"
  | "costInput"
  | "costOutput"
  | "costReasoning"
  | "costCacheRead"
  | "costCacheWrite"
  | "costInputAudio"
  | "costOutputAudio"
  | "limitContext"
  | "limitInput"
  | "limitOutput"
  | "structuredOutput"
  | "temperature"
  | "weights"
  | "knowledge"
  | "releaseDate"
  | "lastUpdated";

export interface ColumnDef {
  key: ColumnKey;
  label: string;
  type: ColumnType;
  desc?: string;
}

const per1MTokens = "per 1M tokens";

export const columns: readonly ColumnDef[] = [
  { key: "provider", label: "Provider", type: "text" },
  { key: "model", label: "Model", type: "text" },
  { key: "family", label: "Family", type: "text" },
  { key: "providerId", label: "Provider ID", type: "text" },
  { key: "modelId", label: "Model ID", type: "text" },
  { key: "toolCall", label: "Tool Call", type: "boolean" },
  { key: "reasoning", label: "Reasoning", type: "boolean" },
  { key: "modalitiesInput", label: "Input", type: "modalities" },
  { key: "modalitiesOutput", label: "Output", type: "modalities" },
  { key: "costInput", label: "Input Cost", type: "number", desc: per1MTokens },
  { key: "costOutput", label: "Output Cost", type: "number", desc: per1MTokens },
  { key: "costReasoning", label: "Reasoning Cost", type: "number", desc: per1MTokens },
  { key: "costCacheRead", label: "Cache Read Cost", type: "number", desc: per1MTokens },
  { key: "costCacheWrite", label: "Cache Write Cost", type: "number", desc: per1MTokens },
  { key: "costInputAudio", label: "Audio Input Cost", type: "number", desc: per1MTokens },
  { key: "costOutputAudio", label: "Audio Output Cost", type: "number", desc: per1MTokens },
  { key: "limitContext", label: "Context Limit", type: "number" },
  { key: "limitInput", label: "Input Limit", type: "number" },
  { key: "limitOutput", label: "Output Limit", type: "number" },
  { key: "structuredOutput", label: "Structured Output", type: "boolean" },
  { key: "temperature", label: "Temperature", type: "boolean" },
  { key: "weights", label: "Weights", type: "text" },
  { key: "knowledge", label: "Knowledge", type: "text" },
  { key: "releaseDate", label: "Release Date", type: "text" },
  { key: "lastUpdated", label: "Last Updated", type: "text" },
];

export const columnCount = columns.length;
