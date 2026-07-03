import Anthropic from "@anthropic-ai/sdk";

import { getAnthropicApiKey, getAnthropicModel } from "./config";

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: getAnthropicApiKey(),
    });
  }
  return anthropicClient;
}

export async function createClaudeMessage(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const client = getClient();
  const model = getAnthropicModel();

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude API からテキスト応答を取得できませんでした。");
  }

  return textBlock.text;
}
