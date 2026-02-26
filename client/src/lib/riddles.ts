import type { RiddleWithAnswers } from "@shared/schema";

export const riddles: RiddleWithAnswers[] = [
    { id: 1, category: "動物", question: "有長長的尾巴，跑得飛快，喜歡吃草不吃肉。", hint: "猜一動物", answers: ["馬"], explanation: "馬有長長的尾巴，跑得非常快，而且是草食性動物，不吃肉。馬也是十二生肖之一喔！" },
    { id: 2, category: "地名", question: "神獸潛伏池水中。", hint: "猜一地名", answers: ["龍潭"], explanation: "中國最有名的神獸就是「龍」，而「池水」就是「潭」。龍＋潭＝龍潭，是桃園市的一個區。" },
    { id: 3, category: "師長", question: "委鬼之木成一姓，博學才俊彥士名。", hint: "猜一石小師長", answers: ["魏博彥"], explanation: "「委」和「鬼」組合成「魏」字，這是姓氏。後半句提到「博學」、「彥士」就是名字。合起來就是石門國小的師長「魏博彥」。" },
    { id: 4, category: "師長", question: "耳東傳芳草頭方，玉冊珊瑚現芳名。", hint: "猜一石小師長", answers: ["陳芳珊"], explanation: "「耳」＋「東」＝「陳」（姓氏）。「草字頭」＋「方」＝「芳」。「珊瑚」取第一個字「珊」。合起來就是「陳芳珊」。" },
    { id: 5, category: "文化", question: "歲末團圓日，圍爐聚一堂，魚肉滿桌香，幸福萬年長。", hint: "猜一過年活動", answers: ["吃年夜飯", "圍爐", "年夜飯"], explanation: "過年時全家人團聚在一起吃年夜飯，這是一年中最重要的一餐。古時候大家圍著火爐坐在一起，所以這個活動也叫「圍爐」。代表團圓和幸福。" },
    { id: 6, category: "字謎", question: "九十九。", hint: "猜一字", answers: ["白"], explanation: "一百減去一就是九十九。把「百」這個字的「一」拿掉，就變成「白」字了！這是經典的拆字謎。" },
    { id: 7, category: "字謎", question: "左邊綠，右邊紅；左邊怕蟲，右邊怕水。", hint: "猜季節一字", answers: ["秋"], explanation: "「秋」字左邊是「禾」，禾苗是綠色的，怕被蟲吃。右邊是「火」，火是紅色的，怕被水澆熄。合起來就是「秋」季！" },
    { id: 8, category: "地名", question: "空中霸王。", hint: "猜一縣市", answers: ["高雄"], explanation: "「空中」即為「高」，「霸王」即為「雄」（英雄、雄霸一方）。合起來就是「高雄」。這是一個非常經典的字面意思謎題。" },
    { id: 9, category: "成語", question: "第十一本書。", hint: "猜一成語", answers: ["不可思議"], explanation: "書本通常一套有十本（十冊），第十一本就超出了範圍，是「不可能有的一冊」。不可能的冊 → 不可思議（思＝思考的冊）！" },
    { id: 10, category: "字謎", question: "在樹上唸饒舌 RAP。", hint: "猜一字", answers: ["桑"], explanation: "饒舌 RAP 就是嘴巴一直「又又又」地念。三個「又」疊起來是「叒」，放在「木」（樹）上面就是「桑」字。桑樹是蠶寶寶吃的桑葉的那棵樹！" },
];

export async function getRiddles() {
    // Return riddles without answers for public use
    return riddles.map(({ answers: _answers, explanation: _explanation, ...rest }) => rest);
}

export async function checkRiddleAnswer(riddleId: number, answer: string) {
    const riddle = riddles.find((r) => r.id === riddleId);
    if (!riddle) return { correct: false, error: "Riddle not found" };

    const isCorrect = riddle.answers.some(
        (a) => a.toLowerCase() === answer.toLowerCase().trim()
    );

    return {
        correct: isCorrect,
        ...(isCorrect ? { answer: riddle.answers[0], explanation: riddle.explanation } : {}),
    };
}
