Page({
  data: {
    currentStep: 0,
    currentScene: {},
    history: [],
    isEnding: false,
    backgroundImageUrl: '',
    // 剧本数据
    scriptData: [
      {
        title: "序幕：战略转移的抉择",
        background: "1934年10月，中央苏区在国民党军队第五次“围剿”下岌岌可危。因“左”倾错误军事路线，红军作战接连失利，苏区日益缩小，粮弹匮乏。为保存革命力量，党中央决定战略转移，开启长征。你是红一方面军某团作战参谋，站在瑞金叶坪村村口，望着即将出征的战士——他们背着简陋步枪，揣着少量干粮，有的在写最后一封家信。你手持尚未最终确定的行军计划，关乎红军命运的抉择，正由你开启。",
        content: "你走进团部临时指挥部，桌上摊着两份路线方案，团长等你给出建议。时间紧迫，每一秒都可能影响部队安危，你必须快速且慎重地选择。",
        choices: [
          {
            letter: "A",
            text: "从瑞金直接向北，经宁都县快速突破国民党军第一道封锁线",
            result: "你的选择不符合历史实际！1934年红军出发时，宁都已被国民党军控制，直接向北行军会陷入敌军重围，导致重大伤亡。请回溯到上一选择，重新思考！",
            nextStep: -1 // 回溯
          },
          {
            letter: "B",
            text: "从瑞金向西南方向出发，先绕过于都河，再沿赣南山区向信丰县前进",
            result: "你的选择符合历史决策！党中央当时正是考虑到赣南山区敌军布防薄弱，且于都河可作为行军的天然屏障，最终确定向西南方向出发。剧情继续推进！",
            nextStep: 1 // 进入下一环节
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景二：渡河物资的准备",
        content: "确定向西南方向出发后，你需协调当地群众准备渡河物资。后勤班长汇报：目前筹集到的物资有限，只能优先保障一项关键需求，你要做出决定。",
        choices: [
          {
            letter: "A",
            text: "优先筹集粮食",
            result: "你的选择不符合历史实际！当时于都河是红军出发的第一道‘关卡’，没有船只和绳索，红军根本无法渡河，后续的行军更无从谈起。请回溯到上一选择，重新权衡！",
            nextStep: -1
          },
          {
            letter: "B",
            text: "优先筹集船只和绳索",
            result: "你的选择符合历史细节！1934年10月，当地群众为帮助红军渡河，连夜将家中的渔船、木筏集中起来，还拆下自家的门板、床板制作临时船只，最终保障了红军顺利渡过于都河。剧情继续推进！",
            nextStep: 2
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景三：行军纪律的传达",
        content: "渡河前，团长让你向全团战士传达行军纪律。你需要确定纪律传达的重点。",
        choices: [
          {
            letter: "A",
            text: "强调“快速行军，不惜一切代价突破敌军防线”",
            result: "你的选择不符合红军纪律！红军是人民的军队，爱护群众利益是根本纪律，且隐蔽行军才能避免暴露行踪，单纯追求速度会导致纪律涣散，还可能暴露行军路线。请回溯到上一选择，重新明确纪律重点！",
            nextStep: -1
          },
          {
            letter: "B",
            text: "强调“爱护群众利益，不拿群众一针一线”",
            result: "你的选择完全符合红军的优良传统！1934年红军出发时，严格遵守‘三大纪律八项注意’，即使在紧急渡河时，也没有损坏群众的一草一木，还留下了银元作为借用物资的报酬，赢得了当地群众的支持。你成功完成了瑞金出发阶段的所有决策，抵达历史结局！",
            nextStep: 3
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "最终结局",
        content: "你成功完成了瑞金出发阶段的关键决策，为红军后续的行军奠定了良好基础。尽管长征的征途漫长且充满艰险，但红军将士们凭借着坚定的革命信念、灵活的战略战术以及人民群众的鼎力支持，必将在这条伟大的道路上奋勇前进，书写人类历史上的奇迹篇章。",
        result: "历史回响：红军长征是人类历史上的伟大奇迹，它证明了中国共产党及其领导的人民军队坚不可摧的意志和战胜一切困难的勇气。",
        choices: [],
        showNext: false,
        showBack: false
      }
    ]
  },

  async onLoad() {
    // 异步获取背景图片URL
    const backgroundImageUrl = await getApp().getImageUrl('瑞金出发.jpg');

    // 初始化显示序幕
    this.setData({
      backgroundImageUrl: backgroundImageUrl,
      currentScene: this.data.scriptData[0]
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
    this.setData({
      currentStep: lastStep,
      currentScene: this.data.scriptData[lastStep],
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
    
    this.setData({
      currentScene: this.data.scriptData[nextStep],
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