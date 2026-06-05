Page({
  data: {
    current: 0,
    books: [], // 将在onLoad中异步获取
    backgroundImageUrl: '',
    plumBgUrl: ''
  },

  async onLoad() {
    console.log("语音会议录页面加载");

    // 异步获取背景图片URL
    const [backgroundImageUrl, plumBgUrl] = await Promise.all([
      getApp().getImageUrl('语音回忆录.jpg'),
      getApp().getImageUrl('梅花.png')
    ]);

    // 异步获取书籍封面图片URL
    const bookConfigs = [
      {
        id: 1,
        title: "离开苏区上征途",
        coverName: "离开苏区上征途.jpg",
        description: "1934年10月，红军开始长征"
      },
      {
        id: 2,
        title: "周副主席到我团",
        coverName: "周副主席到我团.jpg",
        description: "周恩来副主席亲临指导"
      },
      {
        id: 3,
        title: "八过赤水甩敌人",
        coverName: "八过赤水甩敌人.jpg",
        description: "四渡赤水出奇兵"
      },
      {
        id: 4,
        title: "毛儿盖见朱总司令",
        coverName: "毛儿盖见朱总司令.jpg",
        description: "与朱德总司令会面"
      },
      {
        id: 5,
        title: "决战山城堡再上新征途",
        coverName: "决战山城堡再上新征途.jpg",
        description: "长征胜利会师"
      }
    ];

    // 异步获取所有封面图片URL
    const books = await Promise.all(
      bookConfigs.map(async (config) => ({
        id: config.id,
        title: config.title,
        cover: await getApp().getImageUrl(config.coverName),
        description: config.description
      }))
    );

    this.setData({
      books,
      backgroundImageUrl,
      plumBgUrl
    });
  },

  preventMove() {
    // 阻止页面上下滑动
    return false;
  },

  onSwiperChange(e) {
    this.setData({
      current: e.detail.current
    });
  },

  openBook(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/voice_${bookId}/voice_${bookId}`
    });
  }
});