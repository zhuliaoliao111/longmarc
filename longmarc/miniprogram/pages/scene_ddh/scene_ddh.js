Page({
  data: {
    currentStep: 0,
    currentScene: {},
    history: [],
    isEnding: false,
    currentBg: "../../images/强渡大渡河.jpg",
    // 剧本数据保持不变
    scriptData: [
      {
        title: "生死突击",
        content: "浓雾锁河，十七勇士登船，赵章成炮口校准。刘伯承、聂荣臻亲临指挥所。第一船载9名勇士出发，对岸机枪已响。赵章成的迫击炮，是唯一的重火力——只有4发炮弹。突击队即将登岸，敌军正从碉堡涌出反扑。你向孙继先建议：",
        choices: [
          {
            letter: "A",
            text: "固守滩头，等待第二船增援",
            result: "若选A，敌军居高临下反扑，突击队将被压回河中，首渡功亏一篑。",
            nextStep: -1
          },
          {
            letter: "B",
            text: "立即向纵深冲锋，夺取碉堡和制高点",
            result: "孙继先下令：'登岸就冲锋，一步不停！'赵章成两炮命中碉堡，敌军溃逃。后续部队迅速跟进——这一选择拯救了红军命运。",
            nextStep: 1  // 正确指向"巩固渡口"
          },
          {
            letter: "C",
            text: "原地构筑工事，组织火力防御",
            result: "敌军反扑凶猛，原地防御难以坚持，突击队将被迫后撤。",
            nextStep: -1
          },
          {
            letter: "D",
            text: "分兵两路，一路攻碉堡，一路沿河搜索船只",
            result: "兵力有限，分兵会导致两路皆弱，难以达成目标。",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "巩固渡口",
        content: "北岸阵地初定，敌军残部退守山腰，南岸主力等待渡河。渡口虽夺，但危机未解。敌军随时可能反扑，薛岳追兵日益逼近。刘伯承问你：'下一步，怎么确保全军安全渡河？'",
        choices: [
          {
            letter: "A",
            text: "立即派兵沿河搜索更多船只，加快渡河速度",
            result: "只搜船不控高地，敌军居高临下一冲，渡口即失。",
            nextStep: -1
          },
          {
            letter: "B",
            text: "分兵控制渡口两侧高地，构建环形防御阵地",
            result: "红一营迅速攻占安靖坝制高点，架设机枪封锁河面与道路——以点控面，确保渡河安全。",
            nextStep: 2
          },
          {
            letter: "C",
            text: "派小部队深入敌后，破坏交通线延缓敌军增援",
            result: "敌后破坏虽重要，但渡口高地不控，短期内难以见效。",
            nextStep: -1
          },
          {
            letter: "D",
            text: "在南岸构筑工事，准备迎击可能的敌军反扑",
            result: "只守南岸不控北岸高地，敌军仍可居高临下威胁渡口。",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "渡口已开，生路初现",
        backgroundImage: "../../images/强渡大渡河.jpg",
        content: "5月25日中午，红一师开始渡河。木船日夜摆渡，对岸炮声渐远。十七勇士、四名船工、两发炮弹——没有奇迹，只有精准的战术、人民的支持、和钢铁般的执行。这一渡，为红军撕开了绝境的第一道口子。",
        result: "轻点史料 · 意义点睛：十七勇士、四名船工、两发炮弹——没有奇迹，只有精准的战术、人民的支持、和钢铁般的执行。这一渡，为红军撕开了绝境的第一道口子。",
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
      currentBg: scene.backgroundImage || "../../images/强渡大渡河.jpg"
    });
  },

  // 处理选择 - 保持不变
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
      currentStep: choice.nextStep // 直接使用选择的下一步
    });
  },

  // 返回上一步选择 - 保持不变
  goBack() {
    const lastStep = this.data.history.pop();
    const scene = this.data.scriptData[lastStep];
    this.setData({
      currentStep: lastStep,
      currentScene: scene,
      currentBg: scene.backgroundImage || "../../images/强渡大渡河.jpg",
      isEnding: false
    });
  },

  // 进入下一步 - 修复此处逻辑
  goNext() {
    // 关键修复：当前步骤 + 1 才是下一步
    const nextStep = this.data.currentStep;
    
    // 检查是否有下一步
    if (nextStep < this.data.scriptData.length) {
      const scene = this.data.scriptData[nextStep];
      // 检查是否是最后一步
      const isEnding = nextStep === this.data.scriptData.length - 1;
      
      this.setData({
        currentScene: scene,
        currentBg: scene.backgroundImage || "../../images/强渡大渡河.jpg",
        isEnding: isEnding,
        // 显示选择项
        currentScene: {
          ...scene,
          result: "" // 清除结果，显示选择项
        }
      });
    }
  },

  // 返回首页
  goHome() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  }
});
