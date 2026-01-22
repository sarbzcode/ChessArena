export type Difficulty = "beginner" | "intermediate" | "expert";

export type DifficultySettings = {
  skill: number;
  movetime: number;
  depth: number;
  delayMs: number;
};

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  beginner: { skill: 4, movetime: 300, depth: 8, delayMs: 250 },
  intermediate: { skill: 10, movetime: 600, depth: 12, delayMs: 200 },
  expert: { skill: 18, movetime: 900, depth: 16, delayMs: 150 }
};

export function getSettings(difficulty: Difficulty, retry = false): DifficultySettings {
  const base = DIFFICULTY_SETTINGS[difficulty];
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
