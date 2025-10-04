Page({
  data: {
    currentStep: 0,
    currentScene: {},
    history: [],
    isEnding: false,
    backgroundImageUrl: '',
    // 腊子口战役剧本数据
    scriptData: [
      {
        title: "序幕：天险腊子口",
        background: "1935年9月，中央红军突破天险腊子口是打通北上通道的关键一战。腊子口两侧是悬崖峭壁，中间只有一条宽仅数米的隘口，敌人在桥头和两侧山顶构筑了坚固工事，配备了机枪火力点，形成交叉封锁。你作为红四团的作战参谋，跟随部队抵达腊子口外，面前是这道“一夫当关，万夫莫开”的天险，身后是紧追不舍的敌军，必须在天亮前突破防线。",
        content: "团长命令你制定攻坚方案。侦察兵回报：隘口正面宽约30米，桥面已被破坏仅剩一根木梁，敌军一个营凭险据守，两侧山顶有敌军一个旅增援部队正在赶来。你需要在最短时间内提出作战方案：",
        choices: [
          {
            letter: "A",
            text: "正面强攻：集中全团火力压制敌人，组织突击队强行冲过木桥",
            result: "你的选择造成重大伤亡！敌军凭借有利地形和机枪火力，对你方突击队造成毁灭性打击，多次冲锋均告失败，天亮后敌人援军赶到，部队陷入腹背受敌的险境。（提示：腊子口地形狭窄，正面强攻正中敌军下怀。）",
            nextStep: -1 // 回溯
          },
          {
            letter: "B",
            text: "侧翼迂回：派出小股部队攀登右侧悬崖峭壁，绕到敌军后方突袭",
            result: "你的选择符合实战策略！团长采纳了你的建议，决定由正面部队佯攻吸引火力，同时挑选水性好、擅长攀爬的战士组成迂回部队。这一决策为突破腊子口奠定了关键基础。剧情继续推进！",
            nextStep: 1 // 进入下一环节
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景二：悬崖攀登的准备",
        content: "确定“正面佯攻+侧翼迂回”的战术方案后，你需要为迂回部队准备攀登工具。后勤人员汇报，目前可用的攀登器材有限，只能优先准备一种关键装备：",
        choices: [
          {
            letter: "A",
            text: "优先准备绳索和铁钩：确保攀爬时能固定身体，应对陡峭崖壁",
            result: "你的选择符合历史细节！迂回部队携带绳索、铁钩和绑腿，在当地向导指引下找到一处相对平缓的崖壁，利用夜色掩护开始攀爬。这些装备为成功登上悬崖提供了重要保障。剧情继续推进！",
            nextStep: 2
          },
          {
            letter: "B",
            text: "优先准备武器弹药：确保迂回成功后能立即投入战斗，增强火力",
            result: "你的选择导致行动受阻！迂回部队虽然携带了充足弹药，但因缺乏攀爬工具，在陡峭崖壁上多次滑落，不仅延误了时间，还因攀爬声响惊动了敌军哨兵，暴露了行动意图。（提示：没有工具无法完成悬崖攀登，再好的武器也无用。）",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景三：总攻时机的选择",
        content: "凌晨3点，迂回部队传来信号：已成功登上右侧悬崖，但需要时间调整部署。正面佯攻部队已与敌军激战两小时，弹药即将耗尽，官兵疲惫不堪。此时你观察到：东方已泛起鱼肚白，敌军援军距离腊子口仅剩20公里。你建议：",
        choices: [
          {
            letter: "A",
            text: "立即发起总攻：命令正面部队与迂回部队同时行动，趁敌军尚未察觉侧翼威胁",
            result: "你的选择抓住了关键战机！正面部队发起猛烈冲锋吸引敌军主力，迂回部队从悬崖上突然向敌军阵地投掷手榴弹，敌军腹背受敌瞬间溃败。拂晓前，红军成功突破腊子口天险！",
            nextStep: 3
          },
          {
            letter: "B",
            text: "等待迂回部队休整：让正面部队暂时后撤，待迂回部队准备充分后再行动",
            result: "你的选择错失了战机！正面部队后撤时被敌军察觉意图，敌军迅速调整部署加强侧翼防御，同时加快援军速度。当迂回部队发起攻击时，已失去突然性，双方陷入僵持，最终红军被迫放弃腊子口，北上通道被切断。（提示：战机稍纵即逝，历史上红军正是利用夜色发起突袭。）",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "最终结局",
        content: "在你的正确决策支持下，红四团成功突破腊子口天险，为中央红军北上开辟了通道。这场战役是红军长征中具有决定性意义的一仗，粉碎了国民党军企图凭借天险消灭红军的美梦，充分体现了红军将士不畏艰险、灵活机动的战斗精神。",
        result: "历史回响：腊子口战役的胜利，是红军智慧与勇气的结晶。正如毛泽东同志所说：“腊子口一战，打出了红军的威风，打开了红军北上的通道。”",
        choices: [],
        showNext: false,
        showBack: false
      }
    ]
  },

  async onLoad() {
    // 异步获取背景图片URL
    const backgroundImageUrl = await getApp().getImageUrl('腊子口战役.jpg');

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