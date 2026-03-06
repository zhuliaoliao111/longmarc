Page({
  data: {
    currentStep: 0,
    history: [],
    showResult: false,
    resultText: '',
    showBack: false,
    showNext: false,
    backgroundImageUrl: '/images/index/泸定桥.jpg',

    // 背景页文本
    backgroundFullText: `1935年5月，中央红军强渡大渡河后陷入新危机：安顺场渡口仅有3只木船，日渡4000人需1个月，而蒋介石10万重兵正从四面合围，扬言要让红军成“石达开第二”。你作为中革军委作战参谋，需在紧急会议上提出战略建议，决定红军生死走向。`,
    backgroundTypedText: '',
    isTyping: false,
    typingTimer: null,

    // 场景1：安顺场的绝境
    scene1FullText: "1935年5月26日，安顺场紧急会议。周恩来指着地图：“53师已到西昌北，20军几天内就到，3只木船渡不完全军！”朱德补充：“必须开辟第二条通道，否则全军覆没！”你需选最优战略路径。",
    scene1TypedText: "",
    isScene1Typing: false,
    scene1TypingTimer: null,

    // 场景2：生死竞速
    scene2FullText: "5月28日晨，左纵队红四团刚出发就接急电：川军李全山团正火速增援泸定桥，若被敌军抢先占领，奔袭计划将彻底失败。杨成武团长看着你：“怎么才能抢在敌人前面？”",
    scene2TypedText: "",
    isScene2Typing: false,
    scene2TypingTimer: null,

    // 场景3：铁索寒
    scene3FullText: "红四团成功抵达泸定桥，看着仅剩13根铁索的桥面，突击队已准备冲锋。刘伯承同志叮嘱：“夺桥只是第一步，敌军增援很快就到，必须想好后续行动，不能再陷合围！”",
    scene3TypedText: "",
    isScene3Typing: false,
    scene3TypingTimer: null,

    // 场景4：右纵队的抉择
    scene4FullText: "5月29日，左纵队夺桥时，右纵队刘伯承、聂荣臻部在海子山遭遇强敌阻击，与左纵队的联系被切断。参谋急报：“再冲不出去，可能要跟主力失联！”你需为右纵队制定应急方案。",
    scene4TypedText: "",
    isScene4Typing: false,
    scene4TypingTimer: null,

    // 结局文本
    resultFullText: "1935年6月2日，中央红军全军顺利渡过大渡河，蒋介石“大渡河畔围歼红军”的计划彻底破产。从安顺场分兵到飞夺泸定桥，红军以精密的战略部署、昼夜奔袭的毅力、舍生忘死的勇气，创造了军事史上的奇迹。6月12日，红一方面军与红四方面军在懋功会师，为长征胜利迈出关键一步。这场胜利，不是神话，是无数红军战士用热血与智慧铸就的历史丰碑。",
    resultTypedText: "",
    isResultTyping: false,
    resultTypingTimer: null
  },

  onLoad() {
    if (this.data.currentStep === 0) {
      this.startBackgroundTyping();
    }
  },

  // 背景页打字机
  startBackgroundTyping() {
    const fullText = this.data.backgroundFullText;
    let index = 0;
    this.setData({ isTyping: true, backgroundTypedText: '' });

    const timer = setInterval(() => {
      if (index < fullText.length) {
        this.setData({ backgroundTypedText: fullText.substring(0, index + 1) });
        index++;
      } else {
        clearInterval(timer);
        this.setData({ isTyping: false, typingTimer: null });
      }
    }, 80);
    this.setData({ typingTimer: timer });
  },

  // 通用打字机
  startTyping(scene) {
    const fullText = this.data[`${scene}FullText`];
    let index = 0;
    this.setData({
      [`is${scene.charAt(0).toUpperCase() + scene.slice(1)}Typing`]: true,
      [`${scene}TypedText`]: ""
    });

    if (this.data[`${scene}TypingTimer`]) clearInterval(this.data[`${scene}TypingTimer`]);
    const timer = setInterval(() => {
      if (index < fullText.length) {
        this.setData({ [`${scene}TypedText`]: fullText.substring(0, index + 1) });
        index++;
      } else {
        clearInterval(timer);
        this.setData({
          [`is${scene.charAt(0).toUpperCase() + scene.slice(1)}Typing`]: false,
          [`${scene}TypingTimer`]: null
        });
      }
    }, 80);
    this.setData({ [`${scene}TypingTimer`]: timer });
  },

  // 场景1点击逻辑
  handleScene1Click() {
    if (!this.data.showResult) return;
    if (this.data.showBack) {
      this.setData({ 
        showResult: false, showBack: false, showNext: false,
        scene1TypedText: this.data.scene1FullText, isScene1Typing: false
      });
    } else if (this.data.showNext) {
      this.setData({ currentStep: 2, showResult: false, showBack: false, showNext: false });
      this.startTyping("scene2");
    }
  },

  // 场景2点击逻辑
  handleScene2Click() {
    if (!this.data.showResult) return;
    if (this.data.showBack) {
      this.setData({ 
        showResult: false, showBack: false, showNext: false,
        scene2TypedText: this.data.scene2FullText, isScene2Typing: false
      });
    } else if (this.data.showNext) {
      this.setData({ currentStep: 3, showResult: false, showBack: false, showNext: false });
      this.startTyping("scene3");
    }
  },

  // 场景3点击逻辑
  handleScene3Click() {
    if (!this.data.showResult) return;
    if (this.data.showBack) {
      this.setData({ 
        showResult: false, showBack: false, showNext: false,
        scene3TypedText: this.data.scene3FullText, isScene3Typing: false
      });
    } else if (this.data.showNext) {
      this.setData({ currentStep: 4, showResult: false, showBack: false, showNext: false });
      this.startTyping("scene4");
    }
  },

  // 场景4点击逻辑
  handleScene4Click() {
    if (!this.data.showResult) return;
    if (this.data.showBack) {
      this.setData({ 
        showResult: false, showBack: false, showNext: false,
        scene4TypedText: this.data.scene4FullText, isScene4Typing: false
      });
    } else if (this.data.showNext) {
      this.setData({ currentStep: 5, showResult: false, showBack: false, showNext: false });
      this.startTyping("result");
    }
  },

  // 处理选项选择
  handleChoice(e) {
    const nextStep = parseInt(e.currentTarget.dataset.nextstep);
    const result = e.currentTarget.dataset.result;
    this.data.history.push(this.data.currentStep);
    this.setData({
      showResult: true,
      resultText: result,
      showBack: nextStep === -1,
      showNext: nextStep > this.data.currentStep
    });
  },

  // 返回上一步
  goBack() {
    const lastStep = this.data.history.pop();
    if (lastStep !== undefined) {
      this.setData({
        currentStep: lastStep,
        showResult: false,
        showBack: false,
        showNext: false
      });
      if (lastStep === 1) this.setData({ scene1TypedText: this.data.scene1FullText, isScene1Typing: false });
      if (lastStep === 2) this.setData({ scene2TypedText: this.data.scene2FullText, isScene2Typing: false });
      if (lastStep === 3) this.setData({ scene3TypedText: this.data.scene3FullText, isScene3Typing: false });
      if (lastStep === 4) this.setData({ scene4TypedText: this.data.scene4FullText, isScene4Typing: false });
    }
  },

  // 背景页进入场景1
  goNext() {
    if (this.data.isTyping) return;
    this.setData({ currentStep: 1, showResult: false, showBack: false, showNext: false });
    this.startTyping("scene1");
  },

  // 返回首页
  goHome() {
    wx.redirectTo({ url: '/pages/index/index' });
  },

  // 页面卸载清除计时器
  onUnload() {
    Object.keys(this.data).forEach(key => {
      if (key.includes('TypingTimer') && this.data[key]) clearInterval(this.data[key]);
    });
  }
});