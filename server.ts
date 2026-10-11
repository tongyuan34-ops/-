import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Endpoint 1: 大模型学术答疑与伴学问答 (AI Scholar Q&A with Gemini 3.8 Flash)
 */
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    const { question, studyContext } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '问题内容不能为空' });
    }

    const systemInstruction = `
你是「雪穗自习室」内置的大模型伴学导师（基于 Gemini 3.8 Flash）。
你的服务对象是正在专注自习的学者与备考学子。

你的职责：
1. 学术解题与答疑：对学者提问的数理公式推导、编程代码算法、文史哲知识点、外语长难句解析、考试易错点提供结构清晰、严谨透彻的专业解答。
2. 自律与心态疏导：若学者倾诉学不进去、想看娱乐软件、焦虑或疲惫，提供沉静、温暖且切实可行的自律心理调节方法（如五秒起步法、呼吸锚定法、专注分段法）。
3. 排版清爽：使用规范的 Markdown 层次（加粗、列表、公式或代码块），黑白排版友好，言简意赅，直击要害。
    `.trim();

    const userPrompt = `
学者当前正在学习任务：${studyContext || '专注自修'}
学者提问或求助：${question}

请用沉稳清晰的口吻给出专业解答或自律指引：
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const answer = response.text || '暂无法获取解答，请稍后重试。';
    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in /api/ai/ask:', error);
    return res.status(500).json({
      error: '大模型问答出现异常，请稍后重试',
      details: error?.message || String(error),
    });
  }
});

/**
 * Endpoint 1-legacy: 兼容老路径
 */
app.post('/api/scholar/ask', async (req: Request, res: Response) => {
  try {
    const { question, subject, studyContext } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '问题内容不能为空' });
    }

    const systemInstruction = `
你是由「雪穗自习室」接入的【学者大数据学术知识库与思维智库】。
你的服务对象是专注学习的各类学者、考研考证学子、科研工作者及终身自律学习者。

职责与原则：
1. 学术专业与严谨：对数理公式、计算机算法、文史哲理论、法律医学、外语语法及应试难点等提供条理分明、深度权威的解答。
2. 启发式思维引导：不仅仅给出结论，更展示底层逻辑推导过程，帮助学者掌握思考脉络。
3. 界面纯净排版：使用清晰的 Markdown 结构（小标题、重点加粗、步骤列表、代码块或公式），文字优雅利落，摒弃多余套话。
4. 学习关怀：结尾可附一两句清雅简炼的鼓励，勉励学者保持专注心流。
    `.trim();

    const userPrompt = `
学者当前正在学习任务：${studyContext || '通用学术研究与复习'}
所属领域/学科：${subject || '通用学术'}
学者提问：${question}

请根据大数据学术知识储备，为学者提供结构清晰、严密透彻的专业解答。
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const answer = response.text || '暂无法获取解答，请稍后重试。';
    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in /api/scholar/ask:', error);
    return res.status(500).json({
      error: '大数据知识库查询出现异常，请稍后重试',
      details: error?.message || String(error),
    });
  }
});

/**
 * Endpoint 2: 智能体学习总结与周期学情复盘报告 (Study Summary & Cycle Analytics)
 */
app.post('/api/study/summary', async (req: Request, res: Response) => {
  try {
    const {
      taskTitle,
      plannedMinutes,
      actualMinutes,
      isEarlyUnlock,
      unlockReason,
      completedChecklistCount,
      totalChecklistCount,
      cycleStats,
    } = req.body;

    const systemInstruction = `
你是「雪穗自习室」的专属智能伴读导师【雪穗】。
你的使命是帮助自律困难、容易点开娱乐软件、被手机分心的学者建立持久而沉稳的专注力。
你的语气如初雪般恬静澄澈，既温和关切，又充满坚定守正的力量，善于洞察学者的注意力痛点并给出切实可行的自律提升策略。

请以 JSON 格式输出学情总结分析，严格遵循以下结构：
{
  "zenScore": number (1到100的专注心流分),
  "evalGrade": string ("初阶入定" | "心流渐进" | "雪落止境" | "宗师深潜"),
  "comment": string (对本次专注的温和复盘与肯定，150-200字),
  "distractionAdvice": string (针对克服娱乐软件冲动、防沉迷与提升意志力的具体妙招建议，100-150字),
  "cycleReview": string (结合学者的周期累计学习时长与习惯趋势进行周期性评价与展望，80-120字),
  "motto": string (一句深邃励志、抚平浮躁的书卷格言或哲理)
}
    `.trim();

    const prompt = `
请分析学者刚才的自习表现与周期数据：
- 学习任务: ${taskTitle || '未命名自修'}
- 预定专注时长: ${plannedMinutes} 分钟
- 实际坚持时长: ${actualMinutes} 分钟
- 是否中途提前开锁: ${isEarlyUnlock ? '是' : '否'}
${isEarlyUnlock && unlockReason ? `- 提前开锁原因: ${unlockReason}` : ''}
- 任务清单完成度: ${completedChecklistCount || 0} / ${totalChecklistCount || 0}
- 历史周期数据: 本周累计学习 ${cycleStats?.weekTotalMinutes || actualMinutes} 分钟，自律打卡连续 ${cycleStats?.streakDays || 1} 天，累计自习 ${cycleStats?.totalSessions || 1} 次。

请生成客观、深刻且富有感染力的智能学情总结报告。
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = {
        zenScore: 88,
        evalGrade: '心流渐进',
        comment: '在纷繁复杂的干扰中，你选择走进雪穗自习室，坚守了宝贵的专注时光。每一分专注的凝视，都在悄然雕刻内心的从容。',
        distractionAdvice: '下次若想拿起手机点开娱乐应用，不妨先闭眼深呼吸三秒，默念当前的终极目标。让自习室的白噪音重新定住心绪。',
        cycleReview: '随着持续练习，专注的阈值正在不断提升，继续保持当下的周期节奏。',
        motto: '非淡泊无以明志，非宁静无以致远。'
      };
    }

    return res.json({ summary: parsedData });
  } catch (error: any) {
    console.error('Error in /api/study/summary:', error);
    return res.status(500).json({
      error: '生成学情总结失败',
      details: error?.message || String(error),
    });
  }
});

/**
 * Endpoint 3: 智能体自主任务拆解 (Agent Task Decomposition)
 */
app.post('/api/agent/decompose', async (req: Request, res: Response) => {
  try {
    const { taskTitle, subject, durationMinutes } = req.body;
    if (!taskTitle) {
      return res.status(400).json({ error: '请提供学习任务名称' });
    }

    const systemInstruction = `
你是「雪穗自习室」的自律规划智能体【雪穗】。
你的能力是将学者设定的庞大或模糊的学习任务，依据认知负荷理论拆解为 3~4 个粒度适中、抗拖延、具备清晰验收标准的子目标清单。
输出格式要求必须为 JSON 数组：
[
  {"text": "步骤内容（如：精读考点第1~5页并划出核心公式）"}
]
    `.trim();

    const prompt = `
学科：${subject || '通用学术'}
任务：${taskTitle}
计划总时长：${durationMinutes || 45} 分钟

请将该任务拆解为 3~4 个递进式、可落地、能有效抵御分心的微小攻坚目标：
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const raw = response.text || '[]';
    let steps: Array<{ text: string }> = [];
    try {
      steps = JSON.parse(raw);
    } catch {
      steps = [
        { text: '整理核心教材与纸笔，清除桌面杂乱物品' },
        { text: `核心攻坚：深入推进「${taskTitle}」重难点` },
        { text: '闭卷自测或错题提炼，记录盲区与心得' },
      ];
    }

    return res.json({ steps });
  } catch (error: any) {
    console.error('Error in /api/agent/decompose:', error);
    return res.status(500).json({ error: '智能体任务拆解失败' });
  }
});

/**
 * Endpoint 4: 智能体伴学与心态疏导对话 (Agent Companion & Motivation Chat)
 */
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  try {
    const { message, currentTaskTitle } = req.body;
    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    const systemInstruction = `
你是「雪穗自习室」的拟人化伴读智能体【雪穗】。
你的特质：
- 沉稳如初雪、智慧、坚定且善解人意。
- 专门应对学者的拖延心理、注意力涣散、点开娱乐软件的冲动、考前焦虑与精力枯竭。
- 简练温柔，字字击中要害，给出具体的心理锚定技巧（如 5 秒法则、身体扫描、番茄微启动），鼓励学者沉下心来。
- 回复控制在 100~200 字之间，像一位安静坐在对面的同窗益友。
    `.trim();

    const prompt = `
学者当前正在学习任务：${currentTaskTitle || '自主研读'}
学者向雪穗说：${message}

请以伴学智能体【雪穗】的口吻予以解答与陪伴疏导：
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text || '深吸一口气，雪穗就在这里守望着你。' });
  } catch (error: any) {
    console.error('Error in /api/agent/chat:', error);
    return res.status(500).json({ error: '智能体对话出现异常' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`雪穗自习室 Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
