Page({
  data: {
      currentStep: 0,
      currentScene: {},
      history: [],
      isEnding: false,
    backgroundImageUrl: '',
      // 四渡赤水剧本数据
      scriptData: [
        {
          title: "一渡赤水：摆脱围堵的抉择",
          background: "1935年1月，遵义会议后，红军面临国民党军40万兵力的围堵。土城战斗中，川军增援部队突然出现，红军伤亡渐增，弹药告急。赤水河西岸雾气弥漫，东岸枪炮声越来越近，你站在渡口边，望着仅有的几艘木船，必须立刻决定行动方向。",
          content: "毛泽东指着地图分析：“川军封锁了北上之路，硬拼必败。现在有两个选择：要么继续强攻，突破川军防线；要么西渡赤水，向川南古蔺、叙永地区转移，避开敌军锋芒。”",
          choices: [
            {
              letter: "A",
              text: "坚持北上，集中兵力突破川军防线",
              result: "此选择不符合历史决策！川军兵力雄厚且熟悉地形，红军刚经历土城战斗减员，强行突破只会陷入更大包围。请回溯重新思考！",
              nextStep: -1
            },
            {
              letter: "B",
              text: "西渡赤水，向川南机动转移，寻找战机",
              result: "你的选择符合历史！1935年1月29日，红军果断西渡赤水，跳出敌军包围圈，为后续机动创造了条件。剧情继续推进！",
              nextStep: 1
            }
          ],
          showNext: false,
          showBack: false
        },
        {
          title: "二渡赤水：声东击西的谋略",
          background: "1935年2月，红军在川南遭敌军重兵围堵，处境艰难。此时黔北敌军兵力空虚，赤水河东岸雾气朦胧，远处传来敌军调动的马蹄声。你手中的情报显示，遵义地区仅有黔军两个师防守，战斗力较弱。",
          content: "指挥部里，周恩来指着地图说：“川军把我们逼到了绝境，唯有出其不意。是继续在川南与敌军周旋，还是回师东渡赤水，突袭兵力空虚的黔北？”",
          choices: [
            {
              letter: "A",
              text: "回师东渡赤水，突袭黔北遵义地区",
              result: "你的选择符合历史智慧！1935年2月18日，红军二渡赤水，迅速占领遵义，歼灭黔军两个师，取得长征以来最大胜利。剧情继续推进！",
              nextStep: 2
            },
            {
              letter: "B",
              text: "留在川南，与敌军周旋寻找突围机会",
              result: "此选择不符合实际！川军已形成合围之势，继续滞留只会消耗兵力。红军正是通过灵活机动才摆脱困境，请回溯重新决策！",
              nextStep: -1
            }
          ],
          showNext: false,
          showBack: false
        },
        {
          title: "三渡赤水：调动敌军的奇招",
          background: "1935年3月，红军重占遵义后，蒋介石亲自飞赴重庆督战，调集重兵向遵义合围。赤水河畔春意渐浓，但战场气氛愈发紧张。你看着情报上密密麻麻的敌军部署，发现蒋介石判断红军将东渡乌江。",
          content: "毛泽东在指挥部笑道：“蒋介石以为我们要东进，我们偏要西进。是按敌军预料东渡乌江，还是再渡赤水回到川南，把敌军引向西部？”",
          choices: [
            {
              letter: "A",
              text: "东渡乌江，向贵州东部转移",
              result: "此选择正中敌军下怀！蒋介石已在乌江布下重兵，东渡将陷入重围。请回溯理解红军机动战术的精髓！",
              nextStep: -1
            },
            {
              letter: "B",
              text: "三渡赤水，重回川南，引诱敌军向西追击",
              result: "你的选择展现了运动战精髓！1935年3月16日，红军三渡赤水，成功将敌军主力引向川南，为下一步行动创造了有利条件。剧情继续推进！",
              nextStep: 3
            }
          ],
          showNext: false,
          showBack: false
        },
        {
          title: "四渡赤水：跳出重围的决断",
          background: "1935年3月下旬，红军三渡赤水后，国民党军果然大举西调，川南、黔北兵力空虚。赤水河两岸，敌军正匆忙西追，而红军隐蔽在赤水河东岸的密林里，战士们紧握着武器，等待最后的命令。",
          content: "彭德怀兴奋地说：“敌军主力全被我们引到西边了！现在是突破重围的最佳时机。是继续西进与敌军周旋，还是趁虚四渡赤水，向南突破乌江？”",
          choices: [
            {
              letter: "A",
              text: "四渡赤水，向南突破乌江天险",
              result: "你的选择完美契合历史！1935年3月21日，红军秘密四渡赤水，突破乌江天险，彻底跳出敌军包围圈，取得战略转移的决定性胜利。剧情继续推进！",
              nextStep: 4
            },
            {
              letter: "B",
              text: "继续西进，与川军主力展开决战",
              result: "此选择违背了运动战原则！与优势敌军决战会消耗红军有生力量，不符合保存实力的战略目标。请回溯体会红军灵活机动的战术！",
              nextStep: -1
            }
          ],
          showNext: false,
          showBack: false
        },
        {
          title: "最终结局",
          background: "四渡赤水是中国工农红军战争史上以少胜多、灵活机动的经典战例。红军在毛泽东等指挥下，历时三个多月，往返四次渡过赤水河，巧妙摆脱了40万国民党军的围追堵截。",
          content: "你亲历了四渡赤水的关键决策，深刻体会到“声东击西、避实击虚”的军事智慧。这场战役彻底粉碎了蒋介石围歼红军的企图，为长征胜利奠定了基础，也成为毛泽东军事思想的经典范例。",
          result: "历史回响：四渡赤水的胜利，是中国共产党和红军从挫折走向成熟的重要标志。正如刘伯承所说：“这是我军战争史上以少胜多的奇迹，是毛泽东军事指挥艺术的得意之笔。”",
          choices: [],
          showNext: false,
          showBack: false
        }
      ]
  },

  async onLoad() {
    // 异步获取背景图片URL
    const backgroundImageUrl = await getApp().getImageUrl('四渡赤水.jpg');

    // 初始化显示第一个场景
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
      showBack: choice.nextStep === -1,
      showNext: choice.nextStep !== -1
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