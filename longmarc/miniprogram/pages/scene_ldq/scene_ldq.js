Page({
  data: {
    currentStep: 0,
    currentScene: {},
    history: [],
    isEnding: false,
    currentBg: "../../images/三艘小船.jpg",
    // 剧本数据
    scriptData: [
      {
        title: "安顺场的绝境",
        background: "安顺场渡口，中革军委紧急会议现场。1935年5月26日，大渡河畔。仅3只木船，日渡4000人需1个月。薛岳部53师已抵西昌北，杨森20军、“川康边防军”距红军仅数日路程。蒋介石电令刘文辉：'务使朱毛步石达开后尘，覆灭于大渡河畔！'中革军委负责人（周恩来、朱德）召集刘伯承、聂荣臻、林彪、罗荣桓、罗瑞卿，召开紧急会议。避免全军覆没，必须开辟第二条通道。为避免红军被国民党军合围于安顺场，军委应优先选择哪种战略路径？",
        choices: [
          {
            letter: "A",
            text: "集中全部兵力强攻安顺场，扩大渡口规模",
            result: "安顺场渡口规模有限，无法应对敌军合围。！",
            nextStep: -1 // 回溯
          },
          {
            letter: "B",
            text: "分兵两路沿大渡河岸北上，奔袭泸定桥开辟新通道",
            result: "1935年5月26日18时，中革军委电令林彪、刘伯承、聂荣臻：'安顺场渡河迟缓，敌已逼近，决分兵两路，夹河而上，夺取泸定桥，限三日内到达。右路如不能会合，即于川西独立开创局面。",
            nextStep: 1 // 进入下一环节
          },
          {
            letter: "C",
            text: "派小部队佯攻吸引敌军，主力仍从安顺场缓慢渡河",
            result: "敌军已逼近，安顺场已成绝境，缓慢渡河会造成全军覆没。",
            nextStep: -1
          },
          {
            letter: "D",
            text: "沿大渡河南下，寻找其他可大规模渡河的渡口",
            result: "南下会遭遇更多敌军，战略被动。！",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "生死竞速",
        content: "5月27日，左纵队红四团出发。5月28日晨，敌情突变，军委急电！川军李全山团正火速增援泸定桥，左纵队应如何应对？关于面对川军紧急向泸定桥增兵的情况，红军左纵队应优先采取哪种战略应对？",
        choices: [
          {
            letter: "A",
            text: "加快奔袭速度，抢在川军主力到达前夺桥",
            result: "红四团政委杨成武在《飞夺泸定桥》回忆录中记：'28日晨接令，全团沸腾。干部会决定：不埋锅造饭，吃生米喝冷水；不恋战，遇敌则猛打猛冲；不收容，掉队者就地安置。目标只有一个：泸定桥！",
            nextStep: 2
          },
          {
            letter: "B",
            text: "沿途击溃所有川军据点后，再缓慢向泸定桥推进",
            result: "时间紧迫，敌军已逼近，缓慢推进会错失夺桥良机。",
            nextStep: -1
          },
          {
            letter: "C",
            text: "请求右纵队分兵支援，合力阻击川军增援部队",
            result: "右纵队任务艰巨，无法分兵。",
            nextStep: -1
          },
          {
            letter: "D",
            text: "绕路隐蔽行军，避开川军主力后再接近泸定桥",
            result: "绕路会延误时间，敌军会先期占领泸定桥。",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "铁索寒",
        content: "红四团在沙坝天主教堂召开战前会议，组建突击队。夺桥成功后，红军应如何行动，避免再次陷入合围？关于红军夺下泸定桥后，为避免陷入新的战略被动，应采取何种行动？",
        choices: [
          {
            letter: "A",
            text: "固守泸定桥等待后续部队集结",
            result: "敌军增援将至，固守会被合围。",
            nextStep: -1
          },
          {
            letter: "B",
            text: "立即继续北上脱离敌军合围范围",
            result: "5月29日22时，刘伯承抵达东岸，下令：'主力连夜过桥，不得停留！后卫部队放火烧桥头工事阻敌，天亮前全军必须北移10里！",
            nextStep: 3
          },
          {
            letter: "C",
            text: "就地休整补充弹药后再推进",
            result: "敌军逼近，休整会造成被动。",
            nextStep: -1
          },
          {
            letter: "D",
            text: "分兵控制周边渡口，扩大渡河区域",
            result: "时间紧迫，应集中兵力北上。",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "右纵队的真实战斗",
        backgroundImage: "../../images/泸定桥.jpg",
        content: "右纵队刘伯承、聂荣臻部，5月27-29日激战海子山、龙八铺。若右纵队被阻断，无法与左纵队会师，他们应如何行动？关于右纵队（刘伯承、聂荣臻部）若无法与左纵队会合，应采取何种战略行动？",
        choices: [
          {
            letter: "A",
            text: "原路返回安顺场与主力会合",
            result: "安顺场已被敌军控制，返回会陷入绝境。",
            nextStep: -1
          },
          {
            letter: "B",
            text: "在川西开辟新的根据地",
            result: "5月26日军委电文明确：'右路如不能会合，由刘、聂率部于川西独立开创局面，打游击，扩红，待机与主力会合。",
            nextStep: 4
          },
          {
            letter: "C",
            text: "转向川北与红四方面军会合",
            result: "川北路途遥远，敌军阻隔。",
            nextStep: -1
          },
          {
            letter: "D",
            text: "固守大渡河东岸阵地等待援军",
            result: "固守会被敌军消灭。",
            nextStep: -1
          }
        ],
        showNext: false,
        showBack: false
      },
      {
        title: "6月2日，全军渡河完毕",
        backgroundImage: "../../images/泸定桥.jpg",
        content: "蒋介石'大渡河会战'计划彻底破产。6月2日：中央红军全军渡河完毕；6月8日：突破天全、芦山；6月12日：红一方面军先头部队与红四方面军在懋功达维镇会师；蒋介石6月3日电：'朱毛残部竟越天险，实为剿匪以来最大失着。'没有虚构的英雄，只有真实的牺牲；没有浪漫的奇迹，只有精密的计算与铁血的执行。飞夺泸定桥，不是传说，是档案；不是神话，是战报。",
        result: "22名勇士，多数无名——但历史，记得他们每一个人的脚步。",
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
      currentBg: scene.backgroundImage || "../../images/三艘小船.jpg"
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
      currentBg: scene.backgroundImage || "../../images/三艘小船.jpg",
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
      currentBg: scene.backgroundImage || "../../images/三艘小船.jpg",
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
