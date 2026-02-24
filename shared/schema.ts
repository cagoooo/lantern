import { z } from "zod";

export const riddleSchema = z.object({
  id: z.number(),
  question: z.string(),
  hint: z.string(),
});

export const riddleWithAnswersSchema = riddleSchema.extend({
  answers: z.array(z.string()),
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
}
