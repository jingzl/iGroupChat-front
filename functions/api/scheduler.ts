import { modelConfigs, generateAICharacters } from '../../src/config/aiCharacters';
import OpenAI from 'openai';

interface AICharacter {
  id: string;
  name: string;
  tags?: string[];
}

interface MessageHistory {
  role: string;
  content: string;
  name: string;
}

export async function onRequestPost({ env, request }) {
  console.log('scheduler');
  try {
    const { message, history, availableAIs } = await request.json();
    const selectedAIs = await scheduleAIResponses(message, history, availableAIs, env);

    return Response.json({
      selectedAIs: selectedAIs
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function analyzeMessageWithAI(message: string, allTags: string[], env: any, history: MessageHistory[] = []): Promise<string[]> {
    const shedulerAI = generateAICharacters(message, allTags.join(','))[0];
    const modelConfig = modelConfigs.find(config => config.model === shedulerAI.model);
    const apiKey = env[modelConfig.apiKey];
    if (!apiKey) {
      throw new Error(`${modelConfig.model} 的API密钥未配置`);
    }
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: modelConfig.baseURL,
    });

    const prompt = shedulerAI.custom_prompt;

    try {
      const completion = await openai.chat.completions.create({
        model: shedulerAI.model,
        messages: [
          { role: "user", content: prompt },
          ...history.slice(-10), // 添加历史消息
          { role: "user", content: message }
        ],
      });

      const matchedTags = completion.choices[0].message.content?.split(',').map(tag => tag.trim()) || [];
      return matchedTags;
    } catch (error) {
      console.error('AI分析失败:', error.message);
      return [];
    }
}

async function scheduleAIResponses(
  message: string, 
  history: MessageHistory[], 
  availableAIs: AICharacter[],
  env: any
): Promise<string[]> {
  // 1. 收集所有可用的标签
  const allTags = new Set<string>();
  availableAIs.forEach(ai => {
    ai.tags?.forEach(tag => allTags.add(tag));
  });

  // 2. 使用AI模型分析消息并匹配标签
  const matchedTags = await analyzeMessageWithAI(message, Array.from(allTags), env, history);
  console.log('matchedTags', matchedTags, allTags);
  //如果含有"文字游戏"标签，则需要全员参与
  if (matchedTags.includes("文字游戏")) {
    return availableAIs.map(ai => ai.id);
  }
  // 3. 计算每个AI的匹配分数
  const aiScores = new Map<string, number>();
  const messageLC = message.toLowerCase();

  for (const ai of availableAIs) {
    if (!ai.tags) continue;

    let score = 0;
    // 标签匹配分数
    matchedTags.forEach(tag => {
      if (ai.tags?.includes(tag)) {
        score += 2; // 每个匹配的标签得2分
      }
    });

    // 直接提到AI名字额外加分
    if (messageLC.includes(ai.name.toLowerCase())) {
      score += 5;
    }

    // 历史对话相关性加分
    const recentHistory = history.slice(-5); // 只看最近5条消息
    recentHistory.forEach(hist => {
      if (hist.name === ai.name && hist.content.length > 0) {
        score += 1; // 最近有参与对话的AI加分
      }
    });

    if (score > 0) {
      aiScores.set(ai.id, score);
    }
  }

  // 4. 根据分数排序选择AI
  const sortedAIs = Array.from(aiScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  // 5. 如果没有匹配到任何AI，随机选择1-2个
  if (sortedAIs.length === 0) {
    console.log('没有匹配到任何AI，随机选择1-2个');
    const maxResponders = Math.min(2, availableAIs.length);
    const numResponders = Math.floor(Math.random() * maxResponders) + 1;
    
    const shuffledAIs = [...availableAIs]
      .sort(() => Math.random() - 0.5)
      .slice(0, numResponders);
    
    return shuffledAIs.map(ai => ai.id);
  }

  // 6. 限制最大回复数量
  const MAX_RESPONDERS = 3;
  return sortedAIs.slice(0, MAX_RESPONDERS);
} 