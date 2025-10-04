Page({
  data: {
    inputText: '',
    selectedType: 'poetry',
    selectedStyle: 'classical',
    isGenerating: false,
    generatedText: '',
    generatedTime: '',
    historyList: [],
    backgroundImage: '',
    typeMap: {
      'poetry': '诗词创作',
      'prose': '散文创作',
      'story': '故事创作'
    },
    styleMap: {
      'classical': '古典风格',
      'modern': '现代风格',
      'heroic': '豪迈风格'
    }
  },

  async onLoad() {
    console.log('AI文生文页面加载完成');

    // 异步加载背景图片URL
    await this.loadBackgroundImage();

    this.loadHistory();
  },

  // 加载背景图片URL
  async loadBackgroundImage() {
    try {
      const app = getApp();
      const backgroundImageUrl = await app.getImageUrl('文生文.jpg');
      this.setData({
        backgroundImage: backgroundImageUrl
      });
      console.log('AI文生文背景图片URL加载完成');
    } catch (error) {
      console.error('加载AI文生文背景图片URL失败:', error);
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 文本输入
  onTextInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 选择创作类型
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: type
    });
  },

  // 选择创作风格
  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({
      selectedStyle: style
    });
  },

  // 开始创作
  async startCreation() {
    if (!this.data.inputText.trim()) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      });
      return;
    }

    this.setData({ isGenerating: true });

    try {
      wx.showLoading({
        title: 'AI创作中...',
        mask: true
      });

      // 模拟AI文生文功能
      const generatedText = this.generateMockText(
        this.data.inputText.trim(),
        this.data.selectedType,
        this.data.selectedStyle
      );

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      const now = new Date();
      const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

      this.setData({
        generatedText: generatedText,
        generatedTime: timeStr
      });

      // 保存到历史记录
      this.saveToHistory(generatedText, this.data.selectedType, this.data.selectedStyle, timeStr);

      wx.showToast({
        title: '创作成功！',
        icon: 'success'
      });
    } catch (error) {
      console.error('创作失败:', error);
      wx.showToast({
        title: '创作失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isGenerating: false });
      wx.hideLoading();
    }
  },

  // 生成模拟文本
  generateMockText(keywords, type, style) {
    // 基于用户输入的主题生成相关的原创内容，不重复关键词
    const templates = {
      poetry: {
        classical: [
          `长征途中红军凭借意志克服困难，为了家国始终坚定的往下走，成功保留了整个民族的希望千里行，英雄气概贯长虹。艰难困苦何足惧，革命精神永传承。`,
          `万里湘江战役的激烈战斗，死亡的战士们英魂永存路，千山万水不辞劳。红军战士志如钢，胜利凯歌响云霄。`,
          `雪山草地风烟起，英雄儿女踏征程。信念如磐不可摧，光明在前勇向前。`
        ],
        modern: [
          `在历史的道路上，\n我们看到了希望的光芒，\n听到了胜利的歌声，\n感受到了力量的力量。`,
          `征途漫漫，\n不是终点，而是起点，\n不是结束，而是开始，\n永远向前，永远奋斗。`
        ],
        heroic: [
          `啊！英雄的象征！\n你是胜利的号角，\n你是永恒的传奇，\n你是民族的脊梁！`,
          `雄关漫道真如铁，\n而今迈步从头越。\n革命路上显英豪，\n革命精神永不灭！`
        ]
      },
      prose: {
        classical: `在那遥远的历史岁月里，英雄们踏上了艰难的征程。他们不畏艰险，不惧困苦，用坚定的信念和顽强的意志，书写了人类历史上最壮丽的篇章。`,
        modern: `关于那段历史，我想说的是，这不仅是一段往事，更是一种精神。它告诉我们，无论面对多大的困难，只要心中有信念，就能战胜一切。`,
        heroic: `革命精神！这是多么震撼人心的力量！它代表着不屈不挠的意志，代表着永不言败的精神，代表着人类对自由和正义的永恒追求！`
      },
      story: {
        classical: `从前，在革命的征途上，有一位年轻的红军战士。他怀揣着对革命事业的无限忠诚，踏上了这段充满挑战的旅程。`,
        modern: `在历史的故事中，我们看到了人性的光辉。每一个参与者都用他们的行动诠释了什么是真正的英雄主义。`,
        heroic: `革命的传奇故事至今仍在我们心中激荡。那些英勇的战士们用他们的生命和鲜血，为我们谱写了最壮丽的英雄史诗！`
      }
    };

    const typeTemplates = templates[type][style];
    if (Array.isArray(typeTemplates)) {
      return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
    }
    return typeTemplates;
  },

  // 重新创作
  regenerateText() {
    this.startCreation();
  },

  // 复制文本
  copyText() {
    if (!this.data.generatedText) {
      wx.showToast({
        title: '没有可复制的文本',
        icon: 'none'
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.generatedText,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  // 分享文本
  shareText() {
    if (!this.data.generatedText) {
      wx.showToast({
        title: '没有可分享的文本',
        icon: 'none'
      });
      return;
    }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 选择历史记录
  selectHistoryItem(e) {
    const index = e.currentTarget.dataset.index;
    const historyItem = this.data.historyList[index];
    this.setData({
      generatedText: historyItem.content,
      selectedType: historyItem.type,
      selectedStyle: historyItem.style,
      generatedTime: historyItem.time
    });
  },

  // 保存到历史记录
  saveToHistory(content, type, style, time) {
    const historyItem = {
      content: content,
      type: type,
      style: style,
      time: time,
      timestamp: Date.now()
    };

    let historyList = [...this.data.historyList];
    historyList.unshift(historyItem);

    // 最多保存10条记录
    if (historyList.length > 10) {
      historyList = historyList.slice(0, 10);
    }

    this.setData({
      historyList: historyList
    });

    // 保存到本地存储
    wx.setStorageSync('textHistory', historyList);
  },

  // 加载历史记录
  loadHistory() {
    try {
      const historyList = wx.getStorageSync('textHistory') || [];
      this.setData({
        historyList: historyList
      });
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'AI文生文创作 - ' + this.data.inputText,
      path: '/pages/challenge/ai-text'
    };
  },

  onShareTimeline() {
    return {
      title: 'AI文生文创作 - ' + this.data.inputText
    };
  }
});

