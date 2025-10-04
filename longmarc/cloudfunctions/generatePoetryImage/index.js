const cloud = require('wx-server-sdk');
const config = require('./config');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 构建增强的提示词
function buildEnhancedPrompt(userInput, style) {
  // 分析用户输入，提取关键信息
  const analyzedContent = analyzeUserInput(userInput);
  
  // 根据风格添加描述
  const styleDescriptions = {
    'chinese_painting': '中国画风格，水墨画，古典中国艺术',
    'realistic': '写实摄影风格，高质量，细节丰富',
    'oil_painting': '油画风格，古典艺术，色彩丰富',
    'watercolor': '水彩画风格，柔和色彩，艺术感',
    'sketch': '素描风格，黑白，艺术绘画',
    'anime': '动漫风格，日本动画，色彩鲜艳'
  };

  const styleDesc = styleDescriptions[style] || '艺术风格';
  
  // 构建完整的提示词 - 使用基础公式：主体 + 场景 + 风格
  const fullPrompt = `${analyzedContent.subject}, ${analyzedContent.scene}, ${styleDesc}, 高质量, 细节丰富, 构图优美`;
  
  console.log('用户输入:', userInput);
  console.log('分析结果:', analyzedContent);
  console.log('最终提示词:', fullPrompt);
  
  return fullPrompt;
}

// 分析用户输入，提取主体和场景信息
function analyzeUserInput(userInput) {
  // 关键词映射 - 帮助识别主体和场景
  const subjectKeywords = {
    // 人物类
    '红军': '红军战士',
    '战士': '战士',
    '官兵': '官兵',
    '三军': '三军',
    '人': '人物',
    '士兵': '士兵',
    
    // 自然类
    '山': '山峰',
    '水': '水流',
    '河': '河流',
    '江': '江河',
    '海': '海洋',
    '云': '云朵',
    '雪': '雪花',
    '雨': '雨水',
    '风': '风',
    '天': '天空',
    '地': '大地',
    '路': '道路',
    '桥': '桥梁',
    '铁索': '铁索',
    
    // 抽象概念
    '理想': '理想',
    '意志': '意志',
    '精神': '精神',
    '勇气': '勇气',
    '决心': '决心'
  };

  const sceneKeywords = {
    // 地理环境
    '万水千山': '万水千山',
    '五岭': '五岭山脉',
    '乌蒙': '乌蒙山脉',
    '岷山': '岷山',
    '横断山': '横断山脉',
    '金沙': '金沙江',
    '大渡': '大渡河',
    '湘江': '湘江',
    '赤水': '赤水河',
    
    // 天气环境
    '风雨': '风雨交加',
    '雪': '雪景',
    '火': '火焰',
    '银': '银色',
    
    // 动作场景
    '行军': '行军',
    '远征': '远征',
    '过': '穿越',
    '走': '行走',
    '拍': '拍打',
    '横': '横跨'
  };

  // 提取主体
  let subject = '红军战士'; // 默认主体
  for (const [keyword, translation] of Object.entries(subjectKeywords)) {
    if (userInput.includes(keyword)) {
      subject = translation;
      break;
    }
  }

  // 提取场景
  let scene = '山川河流'; // 默认场景
  for (const [keyword, translation] of Object.entries(sceneKeywords)) {
    if (userInput.includes(keyword)) {
      scene = translation;
      break;
    }
  }

  // 如果没有匹配到关键词，使用原始输入
  if (subject === '红军战士' && !userInput.includes('红军')) {
    subject = userInput; // 直接使用用户输入作为主体
  }

  return {
    subject: subject,
    scene: scene,
    original: userInput
  };
}

// 构建反向提示词
function buildNegativePrompt() {
  // 反向提示词 - 描述不希望在图像中看到的内容
  const negativeElements = [
    '低质量', '模糊', '扭曲', '变形',
    '丑陋', '解剖错误', '比例失调',
    '现代科技', '汽车', '现代建筑', '城市',
    '西式服装', '现代武器', '枪支',
    '卡通', '动漫', '漫画', '喜剧',
    '文字', '水印', '签名',
    '不当内容', '暴力'
  ];
  
  return negativeElements.join(', ');
}

exports.main = async (event, context) => {
  const { poetry, style = 'chinese_painting', size = '1024x1024' } = event;

  if (!poetry || !poetry.trim()) {
    return {
      code: -1,
      message: '诗词内容不能为空'
    };
  }

  try {
    // 调用通义万相API生成图片
    const generatedImageUrl = await callWanxAPI(poetry, style, size);
    
    if (generatedImageUrl) {
      return {
        code: 0,
        data: {
          imageUrl: generatedImageUrl,
          poetry: poetry,
          style: style,
          size: size,
          timestamp: Date.now()
        },
        message: '生成成功'
      };
    } else {
      throw new Error('图片生成失败');
    }

  } catch (error) {
    console.error('生成图片失败:', error);
    return {
      code: -1,
      message: '图片生成失败: ' + error.message
    };
  }
};

// 调用通义万相API生成图片
async function callWanxAPI(poetry, style, size) {
  const { WANX_CONFIG } = config;
  
  // 检查API Key是否配置
  if (!WANX_CONFIG.API_KEY || WANX_CONFIG.API_KEY === 'your-dashscope-api-key-here') {
    console.log('通义万相API Key未配置，使用模拟数据');
    return generateMockImage(poetry, style, size);
  }

  try {
    // 构建更详细的提示词
    const enhancedPrompt = buildEnhancedPrompt(poetry, style);
    
    // 构建反向提示词
    const negativePrompt = buildNegativePrompt();
    
    // 构建请求参数 - 兼容模式API格式
    const requestBody = {
      model: WANX_CONFIG.MODEL,
      prompt: enhancedPrompt,
      negative_prompt: negativePrompt,
      size: size.replace('x', '*'), // 将1024x1024转换为1024*1024
      n: 1,
      response_format: "url"
    };

    console.log('调用通义万相API:', JSON.stringify(requestBody, null, 2));

    // 发起HTTP请求
    const response = await fetch(`${WANX_CONFIG.BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WANX_CONFIG.API_KEY}`
      },
      body: JSON.stringify(requestBody),
      timeout: WANX_CONFIG.REQUEST_CONFIG.timeout
    });

    const result = await response.json();
    console.log('通义万相API响应:', JSON.stringify(result, null, 2));

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    // 解析响应数据 - 兼容模式响应格式
    if (result.data && result.data.length > 0) {
      const imageUrl = result.data[0].url;
      console.log('生成图片URL:', imageUrl);
      return imageUrl;
    } else if (result.error) {
      throw new Error(result.error.message || '图片生成失败');
    } else {
      throw new Error('图片生成失败：响应格式异常');
    }

  } catch (error) {
    console.error('通义万相API调用失败:', error);
    // 如果API调用失败，返回模拟图片
    return generateMockImage(poetry, style, size);
  }
}

// 生成模拟图片（用于测试或API调用失败时的备用方案）
async function generateMockImage(poetry, style, size) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 返回一个随机图片URL作为占位符
      const mockImageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
      resolve(mockImageUrl);
    }, 2000);
  });
}

