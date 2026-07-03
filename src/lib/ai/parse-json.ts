export function extractJsonFromText(text: string): string {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return objectMatch[0];
  }

  return text.trim();
}

export function parseJsonResponse<T>(text: string): T {
  const jsonText = extractJsonFromText(text);
  return JSON.parse(jsonText) as T;
}
