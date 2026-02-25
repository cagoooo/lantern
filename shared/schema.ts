import { z } from "zod";

export const riddleSchema = z.object({
  id: z.number(),
  question: z.string(),
  hint: z.string(),
  category: z.enum(["動物", "文化", "師長", "成語", "字謎", "地名"]),
  image: z.string().optional(),
  audio: z.string().optional(),
});

export const riddleWithAnswersSchema = riddleSchema.extend({
  answers: z.array(z.string()),
  explanation: z.string().optional(),
});

export const answerSubmissionSchema = z.object({
  answer: z.string().min(1, "Answer is required"),
});

export type Riddle = z.infer<typeof riddleSchema>;
export type RiddleWithAnswers = z.infer<typeof riddleWithAnswersSchema>;
export type AnswerSubmission = z.infer<typeof answerSubmissionSchema>;

export interface GameState {
  currentRiddleIndex: number;
  solvedRiddles: number[];
  attempts: Record<number, number>;
  score: number;
  titles?: string[];
  badges?: string[];
  timerElapsed?: number;
}
