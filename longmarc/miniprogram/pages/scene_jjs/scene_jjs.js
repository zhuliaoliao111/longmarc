Page({
  data: {
    currentStep: 0,
    currentScene: {},
    history: [],
    isEnding: false,
    currentBg: "../../images/夹金山.jpg",
    // 剧本数据
    scriptData: [
      {
        title: "序幕：天险夹金山",
        background: "1935年6月12日，红军先头部队抵达夹金山脚下。这座海拔4900多米的雪山终年积雪，当地民谣唱道：\"夹金山，夹金山，鸟儿飞不过，凡人不可攀。\"战士们穿着单衣草鞋，望着巍峨雪山，面色凝重。",
        content: "毛泽东召集指挥员开会：\"老乡说必须中午前翻过垭口，否则必遭不测。但战士们饥寒交迫，如何准备？\"你需要制定翻山方案。",
        choices: [
          {
            letter: "A",
            text: "轻装快速翻越，要求部队黎明出发，中途不停留，靠意志力冲刺顶峰",
            result: "此选择存在巨大风险！夹金山空气稀薄，强行冲刺易引发高原反应。历史上红军通过充分准备、团结互助才成功翻越。请重新决策！",
            nextStep: -1 // 回溯
          },
          {
            letter: "B", 
            text: "充分准备，收集辣椒生姜御寒，制作拐杖草鞋，组织互助小组循序渐进",
            result: "你的选择符合历史事实！红军提前准备辣椒御寒，用绑腿布裹脚，干部将战马让给伤病员，正是这种科学准备和团结精神创造了奇迹。剧情继续推进！",
            nextStep: 1 // 进入下一环节
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景二：雪线之上的生死抉择",
        content: "正午时分，先头部队接近雪线。狂风卷着冰碴扑面而来，氧气稀薄使得战士们呼吸困难。突然前方传来惊呼：一名宣传队女战士陷入雪坑，挣扎中加速下陷，救援绳索不够长！指挥员面临抉择：是冒险营救可能耽误全军翻越时机，还是含泪继续前进保证大部队安全？",
        choices: [
          {
            letter: "A",
            text: "立即组织营救，调集所有绳索，哪怕耽误时间也要尽力救出同志",
            result: "你的选择符合红军\"不抛弃、不放弃\"的精神！历史中正是这种团结互助让红军在极端环境下保持凝聚力。虽然冒险，但赢得了军心。",
            nextStep: 2
          },
          {
            letter: "B",
            text: "留下小分队尝试营救，大部队继续前进，必须在天气恶化前翻过垭口",
            result: "此选择可能动摇军心！红军之所以能够走完长征，正是凭借深厚的战友情谊。历史上红军宁可牺牲速度也要保护每一个同志。请重新决策！",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景三：垭口遇险的应急处置",
        content: "下午2时，先头部队终于抵达垭口。突然天气骤变，冰雹夹着暴雪倾泻而下，能见度不足十米。几名战士出现严重高原反应，嘴唇发紫无法行走，后续部队还在艰难攀登。指挥员必须在恶劣天气中快速决策：是立即下山寻找避风处，还是在垭口等待后续部队？",
        choices: [
          {
            letter: "A",
            text: "立即下山，组织强壮战士搀扶病员快速通过危险区域，下山后派人接应",
            result: "你的选择符合历史实际！红军正是果断快速通过垭口，利用下坡速度摆脱恶劣天气，最终与红四方面军胜利会师。",
            nextStep: 3
          },
          {
            letter: "B",
            text: "在垭口短暂集结，等待后续部队，避免人员失散",
            result: "此选择极其危险！夹金山垭口天气瞬息万变，停留可能导致更多战士冻伤牺牲。历史上红军选择快速通过。请重新决策！",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "最终结局",
        content: "翻越夹金山是长征中挑战人类极限的壮举。红军以顽强的意志和科学的准备，成功征服这座\"神山\"，实现了与红四方面军的胜利会师，为长征的最终胜利奠定了基础。你完成了翻越夹金山的关键决策，深刻体会到红军在极端环境下展现的革命乐观主义和团结互助精神。毛泽东感叹：\"我们翻越了一座大山，这是一个伟大的胜利！\"",
        result: "历史回响：夹金山见证了中国工农红军的坚韧不拔。\"红军不怕远征难，万水千山只等闲\"正是这种精神的真实写照。今天，夹金山已成为红色教育基地，继续传递着长征精神的火种。",
        choices: [],
        showNext: false,
        showBack: false
      }
    ]
  },

  onLoad() {
    // 初始化显示序幕
    const scene = this.data.scriptData[0];
    this.setData({
      currentScene: scene,
      currentBg: scene.backgroundImage || "../../images/夹金山.jpg"
    });
  },

  // 处理选择
  handleChoice(e) {
    const index = e.currentTarget.dataset.index;
    const currentScene = this.data.currentScene;
    const choice = currentScene.choices[index];
    
    // 保存当前步骤到历史记录
    this.data.history.push(this.data.currentStep);
    
    // 更新当前场景显示结果
    const updatedScene = {
      ...currentScene,
      result: choice.result,
      choices: [],
      showBack: choice.nextStep === -1, // 如果需要回溯，显示返回按钮
      showNext: choice.nextStep !== -1 // 如果有下一步，显示继续按钮
    };
    
    this.setData({
      currentScene: updatedScene,
      currentStep: choice.nextStep === -1 ? this.data.currentStep : choice.nextStep
    });
  },

  // 返回上一步选择
  goBack() {
    const lastStep = this.data.history.pop();
    const scene = this.data.scriptData[lastStep];
    this.setData({
      currentStep: lastStep,
      currentScene: scene,
      currentBg: scene.backgroundImage || "../../images/夹金山.jpg",
      isEnding: false
    });
  },

  // 进入下一步
  goNext() {
    const nextStep = this.data.currentStep;
    if (nextStep >= this.data.scriptData.length) {
      return;
    }

    // 检查是否是最后一步
    const isEnding = nextStep === this.data.scriptData.length - 1;
    const scene = this.data.scriptData[nextStep];

    this.setData({
      currentScene: scene,
      currentBg: scene.backgroundImage || "../../images/夹金山.jpg",
      isEnding: isEnding
    });
  },

  // 返回首页
  goHome() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  }
});
