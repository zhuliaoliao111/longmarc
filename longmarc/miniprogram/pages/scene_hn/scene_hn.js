Page({
  data: {
    currentStep: 0,
    currentScene: {},
    history: [],
    isEnding: false,
    backgroundImageUrl: '',
    // 会宁会师剧本数据
    scriptData: [
      {
        title: "序幕：胜利的曙光",
        background: "1936年10月，红一方面军（中央红军）与红二、四方面军历经千难万险，即将在甘肃会宁实现胜利会师。这是中国工农红军长征的终点，也是中国革命史上的重要里程碑。你作为红一方面军的宣传干事，随先头部队抵达会宁城外，负责会师前的筹备工作。城内群众听闻红军到来，既好奇又带着些许不安，而远方的战友们正克服最后一段路途的疲惫与险阻，向会宁集结。",
        content: "部队首长交给你第一项任务：如何向会宁群众介绍即将到来的三大主力会师。当地老乡因长期受国民党宣传影响，对红军了解有限。你需要制定宣传方案：",
        choices: [
          {
            letter: "A",
            text: "张贴布告宣传：印发文字布告说明会师意义，强调红军的革命宗旨",
            result: "你的方法效果有限！当地多数群众不识字，布告未能有效传递信息，反而因文字表述生硬，让部分老乡产生距离感。（提示：宣传应结合群众实际情况，避免脱离群众。）",
            nextStep: -1 // 回溯
          },
          {
            letter: "B",
            text: "开展现场宣讲：组织战士与老乡面对面交流，用通俗语言讲述长征故事",
            result: "你的做法获得群众认可！战士们用朴实的语言讲述长征中的艰难险阻和革命理想，老乡们逐渐了解红军是为穷人打天下的队伍，开始主动为部队提供帮助。剧情继续推进！",
            nextStep: 1 // 进入下一环节
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景二：会师仪式的筹备",
        content: "群众工作初见成效，会宁城内外洋溢着期待的气氛。首长指示你负责会师仪式的核心环节安排，目前有两项关键工作需要确定优先级：",
        choices: [
          {
            letter: "A",
            text: "优先准备物资：集中力量筹集粮食、布料，确保会师时战士们能吃上饱饭、换上整洁衣物",
            result: "你的选择符合实际需求！经过长途跋涉的红军战士最需要的是基本生活保障，充足的物资让战友们感受到了胜利的温暖，也体现了会宁群众对红军的支持。剧情继续推进！",
            nextStep: 2
          },
          {
            letter: "B",
            text: "优先布置场地：搭建宏伟的主席台、悬挂标语横幅，打造隆重的仪式氛围",
            result: "你的选择脱离实际情况！当时红军物资极度匮乏，过度追求仪式排场不仅消耗有限资源，还可能让刚刚了解红军的群众产生误解。（提示：红军向来崇尚简朴务实，反对形式主义。）",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景三：会师后的行动方向",
        content: "1936年10月10日，三大主力红军在会宁胜利会师，全城欢腾。但此时，国民党军队仍在周边部署重兵，企图围歼红军。在庆祝会师的同时，首长让你参与讨论下一步行动方向：",
        choices: [
          {
            letter: "A",
            text: "原地休整待命：认为会师后部队疲惫，应在会宁地区休整补充，再确定下一步计划",
            result: "你的建议存在风险！会宁地处狭长地带，不利于大部队机动，且国民党军正在迅速合围，长期停留可能陷入重围。（提示：历史上红军会师后迅速调整部署，避免了被动局面。）",
            nextStep: -1
          },
          {
            letter: "B",
            text: "主动战略转移：建议部队分批次向陕北苏区转移，与当地红军汇合，形成更强大的力量",
            result: "你的建议符合历史决策！红军会师后不久即向陕北转移，不仅摆脱了敌军包围，还为中国革命保存了核心力量，为后续抗日战争的爆发做好了战略准备。",
            nextStep: 3
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "最终结局",
        content: "会宁会师标志着长征的胜利结束，三大主力红军的胜利会师，粉碎了国民党反动派企图消灭红军的图谋，保存了党和红军的基干力量，开创了中国革命的新局面。你参与的筹备工作，让这场历史性的会师更加圆满，也让会宁百姓亲眼见证了红军的纪律与理想。",
        result: "历史回响：会宁会师是中国革命史上的伟大事件，它证明了中国共产党领导的人民军队是不可战胜的，为中国革命保留了珍贵的火种，照亮了民族解放的道路。",
        choices: [],
        showNext: false,
        showBack: false
      }
    ]
  },

  async onLoad() {
    // 异步获取背景图片URL
    const backgroundImageUrl = await getApp().getImageUrl('会宁会师.jpg');

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