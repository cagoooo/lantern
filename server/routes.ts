import type { Express } from "express";
import { createServer, type Server } from "http";
import { answerSubmissionSchema, type RiddleWithAnswers } from "@shared/schema";

const riddles: RiddleWithAnswers[] = [
  { id: 1, question: "有長長的尾巴，跑得飛快，喜歡吃草不吃肉。", hint: "猜一動物", answers: ["馬"] },
  { id: 2, question: "神獸潛伏池水中。", hint: "猜一地名", answers: ["龍潭"] },
  { id: 3, question: "委鬼之木成一姓，博學才俊彥士名。", hint: "猜一石小師長", answers: ["魏彥士"] },
  { id: 4, question: "耳東傳芳草頭方，玉冊珊瑚現芳名。", hint: "猜一石小師長", answers: ["陳芳珊"] },
  { id: 5, question: "歲末團圓日，圍爐聚一堂，魚肉滿桌香，幸福萬年長。", hint: "猜一過年活動", answers: ["圍爐", "吃年夜飯", "年夜飯"] },
  { id: 6, question: "九十九。", hint: "猜一字", answers: ["白"] },
  { id: 7, question: "左邊綠，右邊紅；左邊怕蟲，右邊怕水。", hint: "猜季節一字", answers: ["秋"] },
  { id: 8, question: "空中霸王。", hint: "猜一縣市", answers: ["嘉義"] },
  { id: 9, question: "第十一本書。", hint: "猜一成語", answers: ["不可思議"] },
  { id: 10, question: "在樹上唸饒舌 RAP。", hint: "猜一字", answers: ["桑"] },
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/riddles", (_req, res) => {
    const publicRiddles = riddles.map(({ answers: _answers, ...rest }) => rest);
    res.json(publicRiddles);
  });

  app.post("/api/riddles/:id/check", (req, res) => {
    const riddleId = parseInt(req.params.id);
    if (isNaN(riddleId)) {
      return res.status(400).json({ error: "Invalid riddle ID" });
    }

    const parseResult = answerSubmissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { answer } = parseResult.data;
    const riddle = riddles.find((r) => r.id === riddleId);
    if (!riddle) {
      return res.status(404).json({ error: "Riddle not found" });
    }

    const isCorrect = riddle.answers.some(
      (a) => a.toLowerCase() === answer.toLowerCase().trim()
    );

    res.json({
      correct: isCorrect,
      ...(isCorrect ? { answer: riddle.answers[0] } : {}),
    });
  });

  return httpServer;
}
