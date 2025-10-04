Page({
  data: {
    currentStep: 0,
    currentScene: {},
    history: [],
    isEnding: false,
    backgroundImageUrl: '',
    // 遵义会议剧本数据
    scriptData: [
      {
        title: "序幕：危急时刻的抉择",
        background: "1935年1月，中央红军突破乌江天险抵达遵义城。此时红军从长征出发时的8.6万人锐减至3万余人，连续的军事失利让部队士气低落，“左”倾错误军事路线的危害日益凸显。你作为红军总部的一名参谋，亲历了这一路的艰难突围，深知此刻必须纠正错误才能挽救红军、挽救革命。遵义城的一座两层小楼里，一场决定党和红军命运的会议即将召开。",
        content: "会议召开前，毛泽东同志找到你了解前线官兵的思想动态。他问：“当前部队最迫切需要解决的问题是什么？”你结合沿途观察，给出的回答是：",
        choices: [
          {
            letter: "A",
            text: "补充物资装备：建议会议重点讨论如何向当地群众征集粮食和弹药，解决部队燃眉之急",
            result: "你的判断未能抓住核心！物资匮乏确实是问题，但更深层的危机是军事指挥的错误——如果不纠正“左”倾路线，即使补充再多物资，也会在错误指挥下消耗殆尽。（提示：历史证明，路线问题才是决定红军生死存亡的关键。）",
            nextStep: -1 // 回溯
          },
          {
            letter: "B",
            text: "纠正军事路线：建议会议重点检讨第五次反“围剿”以来的军事错误，重新确立正确的指挥原则",
            result: "你的判断切中要害！毛泽东同志赞许地点点头：“部队的眼睛是雪亮的，大家都看清了问题的根子。”这一意见为即将召开的会议明确了核心议题，剧情继续推进！",
            nextStep: 1 // 进入下一环节
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景二：会议中的争论焦点",
        content: "1935年1月15日，遵义会议正式召开。会议室里气氛严肃，关于军事路线的争论十分激烈。“左”倾错误的代表坚持认为第五次反“围剿”的失败是“客观原因”，而毛泽东等同志则系统批判了错误的军事指挥。当会议讨论到“是否应该撤销博古、李德的军事指挥权”时，主持人让你发表意见：",
        choices: [
          {
            letter: "A",
            text: "主张维持现状：认为临阵换将不利于军心稳定，建议保留博古、李德的指挥权，同时吸收毛泽东参与军事决策",
            result: "你的建议存在妥协性！历史已经证明，博古、李德的错误指挥是导致红军被动的直接原因，不彻底纠正就无法扭转危局。（提示：遵义会议的关键意义正在于敢于直面错误、彻底纠错。）",
            nextStep: -1
          },
          {
            letter: "B",
            text: "支持改组领导：列举第五次反“围剿”以来的多次指挥失误，建议撤销博古、李德的军事指挥权，确立新的领导核心",
            result: "你的发言得到多数同志赞同！会议最终通过了《中央关于反对敌人五次“围剿”的总结的决议》，肯定了毛泽东等同志的正确军事路线，为改组中央领导机构奠定了基础。剧情继续推进！",
            nextStep: 2
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景三：新领导集体的决策",
        content: "会议选举毛泽东为中央政治局常委，取消了博古、李德的最高军事指挥权，标志着党的第一代中央领导集体开始形成。此时红军面临的迫切问题是：下一步向哪里进军？你作为参谋人员，参与了新领导集体的首次军事决策讨论：",
        choices: [
          {
            letter: "A",
            text: "继续北上：坚持原定计划，从遵义向北突破长江，与红四方面军汇合",
            result: "你的建议未考虑实际变化！此时国民党军已在长江沿岸布下重兵，继续北上必然陷入重围。（提示：灵活机动是红军的重要战术原则，新领导集体的高明之处正在于审时度势。）",
            nextStep: -1
          },
          {
            letter: "B",
            text: "四渡赤水：建议利用贵州敌军兵力薄弱的特点，先向川黔边境机动，寻找战机调动敌人，再相机北渡长江",
            result: "你的建议与新领导集体的决策不谋而合！这一灵活机动的战略部署，为后来四渡赤水、巧渡金沙江等经典战例奠定了基础，红军从此摆脱了被动挨打的局面。",
            nextStep: 3
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "最终结局",
        content: "遵义会议在极其危急的历史关头，挽救了党，挽救了红军，挽救了中国革命，是中国共产党历史上一个生死攸关的转折点。你参与的这场伟大会议，标志着中国共产党开始独立自主地运用马克思主义基本原理解决自己的路线、方针和政策问题，开启了中国革命胜利的新征程。",
        result: "历史回响：正如毛泽东同志后来所说，遵义会议是中国革命从失败走向胜利的转折点。这次会议确立了毛泽东在党中央和红军的领导地位，为红军胜利完成长征、开创中国革命新局面提供了最重要的保证。",
        choices: [],
        showNext: false,
        showBack: false
      }
    ]
  },

  async onLoad() {
    // 异步获取背景图片URL
    const backgroundImageUrl = await getApp().getImageUrl('遵义会议.jpg');

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