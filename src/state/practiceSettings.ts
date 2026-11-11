import * as z from "zod";
import { instrumentValidator } from "../config";

export const practiceSettingsValidator = z.object({
  latencyOffsetMs: z.number().default(0),
  latencyCalibratedAt: z.number().optional(),
  sensitivity: z.preprocess(
    (v) => typeof v === "number" ? Math.min(3, Math.max(0.3, v)) : v,
    z.number().default(1)
  ),
  difficulty: z.enum(["easy", "normal", "hard"]).default("easy"),
  micPromptAcked: z.boolean().default(false),
  headphonesWarningAcked: z.boolean().default(false),
  lastInstrument: instrumentValidator.optional(),
  lastMode: z.enum(["instrument", "band"]).default("instrument"),
  lastTuneName: z.string().optional(),
  lastPatternName: z.string().optional(),
}).default(() => ({}));

export type PracticeSettings = z.infer<typeof practiceSettingsValidator>;
export type PracticeSettingsOptional = z.input<typeof practiceSettingsValidator>;

export function normalizePracticeSettings(data?: PracticeSettingsOptional): PracticeSettings {
  return practiceSettingsValidator.parse(data);
}

export function loadPracticeSettings(
  raw: string | null,
): { settings: PracticeSettings; recovered: boolean } {
  if (raw == null) return { settings: normalizePracticeSettings(), recovered: false };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { settings: normalizePracticeSettings(), recovered: true };
  }
  const result = practiceSettingsValidator.safeParse(parsed);
  if (result.success) return { settings: result.data, recovered: false };
  return { settings: normalizePracticeSettings(), recovered: true };
}
