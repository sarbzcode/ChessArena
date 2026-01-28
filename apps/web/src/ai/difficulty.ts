export type Difficulty = "beginner" | "intermediate" | "expert";

export type DifficultySettings = {
  skill: number;
  movetime: number;
  depth: number;
  delayMs: number;
};

export type AiMode = "ai" | "aivsai";

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  beginner: { skill: 4, movetime: 300, depth: 8, delayMs: 250 },
  intermediate: { skill: 10, movetime: 600, depth: 12, delayMs: 200 },
  expert: { skill: 18, movetime: 900, depth: 16, delayMs: 150 }
};

const AIVSAI_EXPERT_SETTINGS: DifficultySettings = {
  skill: 20,
  movetime: 1500,
  depth: 24,
  delayMs: 150
};

export function getSettings(
  difficulty: Difficulty,
  retry = false,
  mode: AiMode = "ai"
): DifficultySettings {
  const base =
    mode === "aivsai" && difficulty === "expert"
      ? AIVSAI_EXPERT_SETTINGS
      : DIFFICULTY_SETTINGS[difficulty];
  if (!retry) {
    return base;
  }
  return {
    ...base,
    movetime: base.movetime + 250
  };
}

export function getMoveDelayMs(difficulty: Difficulty): number {
  return DIFFICULTY_SETTINGS[difficulty].delayMs;
}
