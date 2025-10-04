Page({
  data: {
    currentStep: 0,
    currentScene: {},
    history: [],
    isEnding: false,
    backgroundImageUrl: '',
    // 湘江战役剧本数据
    scriptData: [
      {
        title: "场景一：行军路线的初步抉择",
        background: "1934年11月25日，红军突破三道封锁线后，直面湘江天险。指挥部内油灯摇曳，将领们面色凝重，地图上密密麻麻标注着40万国民党军的合围态势。远处敌机轰鸣，战士们紧握步枪，等待着决定命运的指令。",
        content: "彭德怀指着地图说道：'面前两条路：一是强渡全州、兴安间湘江，江面窄但敌防守严密；二是迂回灌阳山区，避敌锋芒但延误时间，辎重难行。'你需要给出关键建议。",
        choices: [
          {
            letter: "A",
            text: "强渡湘江，令红一、红三军团抢占渡口，掩护中央纵队趁敌未合围突破",
            result: "你的选择符合历史决策！红军正是通过果断突击，在敌军完成合围前抢占了渡口阵地，为中央纵队过江创造了机会。剧情继续推进！",
            nextStep: 1
          },
          {
            letter: "B",
            text: "迂回灌阳，先头部队开路，纵队弃部分辎重轻装前进",
            result: "你的选择不符合历史实际！灌阳山区早已被桂军设伏，且迂回会导致中央纵队与作战部队脱节，陷入更大危险。请回溯重新思考！",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景二：渡口防守的兵力调配",
        background: "1934年11月27日，湘江渡口硝烟弥漫。红一、红三军团已控制部分阵地，中央纵队正通过浮桥过江。北边湘军疯狂反扑，红一军团1师阵地岌岌可危；南边桂军迂回夹击，通讯兵冒火穿梭传递急报，弹药即将告罄。",
        content: "林彪望着北面激战的阵地说：'红一军团1师快顶不住了！要么从红三军团调一个师支援，要么收缩阵地保浮桥。'你的决策将直接影响渡江安全。",
        choices: [
          {
            letter: "A",
            text: "调红三军团4师援北，协同红一军团，令红二、红五军团牵制桂军",
            result: "你的选择符合历史战术！红军通过协同作战，成功顶住了湘军进攻，牵制了桂军，为中央纵队过江争取了宝贵时间。剧情继续推进！",
            nextStep: 2
          },
          {
            letter: "B",
            text: "收缩阵地保浮桥，让红一军团放弃外围，全力掩护纵队过江",
            result: "你的选择不符合战场实际！收缩阵地会导致敌军形成南北夹击，浮桥将直接暴露在炮火之下，后果不堪设想。请回溯重新决策！",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "场景三：中央纵队的转移策略",
        background: "1934年11月29日，多数人员已过江，但东岸仍有300余名机关人员和20箱重要文件滞留。敌军东西夹击的总攻已经开始，枪声震耳欲聋，担架队冒死运送伤员，指挥部内争论不休。",
        content: "周恩来攥着怀表焦急地说：'时间紧迫！必须决定剩余人员物资如何转移！'你的选择将关系到红军'家底'的安危。",
        choices: [
          {
            letter: "A",
            text: "轻装速渡，人员弃非必要辎重，令红五军团34师留守掩护",
            result: "你的选择符合历史事实！红五军团34师作为'铁流后卫'，拼死掩护主力过江，虽付出巨大牺牲但保住了革命火种。你完成了湘江战役的关键决策！",
            nextStep: 3
          },
          {
            letter: "B",
            text: "全力搬运辎重，延缓渡江速度，让红34师同时护运物资并抵御敌军",
            result: "你的选择忽视了战场优先级！搬运辎重会延误渡江时机，导致红34师防线崩溃，重要人员和物资将陷入重围。请回溯重新抉择！",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "最终结局",
        background: "湘江战役是长征中最惨烈的战斗，红军从出发时的8.6万人锐减至3万余人，但成功突破了国民党军的第四道封锁线，粉碎了蒋介石'围歼'红军于湘江以东的企图。",
        content: "你完成了湘江战役的关键决策，深刻体会到红军在绝境中展现的战略智慧与牺牲精神。这场战役让党和红军认识到'左'倾错误的危害，为后来遵义会议的召开埋下伏笔。",
        result: "历史回响：湘江战役的血与火，淬炼了红军的钢铁意志。正如老一辈革命家所说：'三年不饮湘江水，十年不食湘江鱼'，这场战役永远铭刻在中国革命的史册上。",
        choices: [],
        showNext: false,
        showBack: false
      }
    ]
  },

  async onLoad() {
    // 异步获取背景图片URL
    const backgroundImageUrl = await getApp().getImageUrl('湘江.jpg');

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
