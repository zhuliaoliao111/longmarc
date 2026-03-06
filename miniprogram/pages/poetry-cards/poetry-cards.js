Page({
  data: {
    showModal: false,
    selectedPoetry: null,
    backgroundImage: '',
    poetryList: [
      {
        title: '《七律·铁血军魂》\n诗/李桂强',
        image: '',
        annotation: '八一枪声震九垓，\n红旗漫卷井冈来。\n长征踏破千山雪，\n抗战熔成万仞崖。\n导弹巡天惊魍魉，\n蛟龙蹈海戍轮台。\n金戈铁马雄师在，\n不许烽烟犯界牌。',
        rightAnnotation: '《七律·铁血军魂》是当代书法家、诗人李桂强创作的一首七言律诗。\n此诗首联以"八一枪声"起笔，追忆人民军队创建与井冈山会师的光辉起点；颔联凝练概括长征之艰与抗战之伟，以"踏破千山雪""熔成万仞崖"展现钢铁意志；颈联笔锋转向当代，以"导弹巡天""蛟龙蹈海"勾勒现代化强军图景；尾联以"金戈铁马""不许犯界"铿锵收束，彰显捍卫和平的坚定决心。全篇以时间为轴，融历史雄魄与时代气象于一炉，语言铿锵、意象磅礴，是一曲对中国人民解放军光辉历程与强军使命的深情礼赞。'
      },
      {
        title: '《沁园春·长沙》\n词/毛泽东',
        image: '',
        annotation: '独立寒秋，湘江北去，橘子洲头。\n看万山红遍，层林尽染；漫江碧透，百舸争流。\n鹰击长空，鱼翔浅底，万类霜天竞自由。\n怅寥廓，问苍茫大地，谁主沉浮？\n携来百侣曾游，忆往昔峥嵘岁月稠。\n恰同学少年，风华正茂；书生意气，挥斥方遒。\n指点江山，激扬文字，粪土当年万户侯。\n曾记否，到中流击水，浪遏飞舟？',
        rightAnnotation: '《沁园春·长沙》是毛泽东于1925年晚秋所作的一首词。\n此词上阕描绘独立橘子洲头所见壮丽秋景，以“万类霜天”之生机引发出“谁主沉浮”的深沉一问；下阕追忆往昔与同学少年“指点江山”的峥嵘岁月，以“中流击水”的豪情作答。全词情景交融，展现了青年革命家胸怀天下、昂扬自信的豪迈气概。'
      },
      {
        title: '《沁园春·雪》\n词/毛泽东',
        image: '',
        annotation: '北国风光，\n千里冰封，\n万里雪飘。\n望长城内外，\n惟余莽莽；\n大河上下，\n顿失滔滔。\n山舞银蛇，\n原驰蜡象，\n欲与天公试比高。\n须晴日，\n看红装素裹，\n分外妖娆。\n江山如此多娇，\n引无数英雄竞折腰。\n惜秦皇汉武，\n略输文采；\n唐宗宋祖，\n稍逊风骚。\n一代天骄，\n成吉思汗，\n只识弯弓射大雕。\n俱往矣，\n数风流人物，\n还看今朝。',
        rightAnnotation: '《沁园春·雪》是毛泽东于1936年创作的一首词。\n上阕以壮阔笔触描绘北国雪景，“山舞银蛇”等句展现天地伟力；下阕纵论历代帝王“略输文采”，最终以“数风流人物，还看今朝”作结，将个人抱负与时代使命相融合，展现出超越历史的豪迈气魄与坚定自信。'
      },
      {
        title: '《清平乐·六盘山》\n词/毛泽东',
        image: '',
        annotation: '天高云淡，\n望断南飞雁。\n不到长城非好汉，\n屈指行程二万。\n六盘山上高峰，\n红旗漫卷西风。\n今日长缨在手，\n何时缚住苍龙？',
        rightAnnotation: '《清平乐·六盘山》是毛泽东1935年翻越六盘山时的咏怀之作。上阕以「望断南飞雁」抒写革命情怀，「不到长城非好汉」铿锵有力；下阕展现「红旗漫卷」的胜利画面，结句「何时缚住苍龙」则表达了对革命胜利的急切期待与必胜信念。'
      },
      {
        title: '《清平乐·会昌》\n词/毛泽东',
        image: '',
        annotation: '东方欲晓，\n莫道君行早。\n踏遍青山人未老，\n风景这边独好。\n会昌城外高峰，\n颠连直接东溟。\n战士指看南粤，\n更加郁郁葱葱。',
        rightAnnotation: '《清平乐·会昌》是毛泽东于1934年创作的一首词。\n此词以“东方欲晓”起笔，通过“踏遍青山”展现革命者的豪迈情怀，“风景这边独好”既写眼前景更喻革命前景。下阕描绘会昌山水连绵之景，以“战士指看南粤”作结，在艰难处境中展现出乐观精神与远大眼光。'
      },
      {
        title: '《清平乐·六盘山》\n词/毛泽东',
        image: '',
        annotation: '天高云淡，\n望断南飞雁。\n不到长城非好汉，\n屈指行程二万。\n六盘山上高峰，\n红旗漫卷西风。\n今日长缨在手，\n何时缚住苍龙？',
        rightAnnotation: '《清平乐·六盘山》是毛泽东于1935年创作的一首词。\n此词上阕以“天高云淡”起笔，回顾长征“行程二万”的壮举，“不到长城非好汉”成为传世名句；下阕写在六盘山巅见红旗漫卷，以“长缨在手”设问作结，表达了红军北上抗日的坚强意志与必胜信念。'
      },
      {
        title: '《渔家傲·反第一次大围剿》\n词/毛泽东',
        image: '',
        annotation: '万木霜天红烂漫，\n天兵怒气冲霄汉。\n雾满龙冈千嶂暗，\n齐声唤，\n前头捉了张辉瓒。\n二十万军重入赣，\n风烟滚滚来天半。\n唤起工农千百万，\n同心干，\n不周山下红旗乱。',
        rightAnnotation: '《渔家傲·反第一次大围剿》是毛泽东1931年春创作的战役实录。上阕以「万木霜天」起兴，描绘龙冈大捷生擒敌酋的胜利场景；下阕写敌军再次来犯，以「唤起工农千百万」呼应「不周山下红旗乱」的典故，展现人民战争的磅礴力量。'
      }
    ]
  },

  async onLoad() {
    console.log('诗词画廊页面加载完成');

    // 异步获取图片URL
    await this.loadImageUrls();
  },

  // 加载图片URL
  async loadImageUrls() {
    try {
      const app = getApp();
      const imageNames = [
        '七律铁血军魂.jpg',
        '沁园春长沙.jpg',
        '沁园春雪.jpg',
        '清平乐.jpg',
        '清平乐会昌.jpg',
        '清平乐六盘山.jpg',
        '渔家傲 反第一次大围剿.jpg'
      ];

      const imageUrls = await Promise.all(imageNames.map(name => app.getImageUrl(name)));
      const backgroundImageUrl = await app.getImageUrl('诗词书法.jpg');

      const updatedPoetryList = this.data.poetryList.map((poetry, index) => ({
        ...poetry,
        image: imageUrls[index]
      }));

      this.setData({
        poetryList: updatedPoetryList,
        backgroundImage: backgroundImageUrl
      });

      console.log('诗词图片URL加载完成');
    } catch (error) {
      console.error('加载诗词图片URL失败:', error);
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 选择诗词作品
  selectPoetry(e) {
    const index = e.currentTarget.dataset.index;
    const poetry = this.data.poetryList[index];
    
    // 显示自定义弹窗
    this.setData({
      showModal: true,
      selectedPoetry: poetry
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showModal: false,
      selectedPoetry: null
    });
  },

  // 阻止弹窗背景滚动
  preventTouchMove() {
    return false;
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '诗词书法画廊 - 以心看长征',
      path: '/pages/poetry-cards/poetry-cards'
    };
  },

  onShareTimeline() {
    return {
      title: '诗词书法画廊 - 以心看长征'
    };
  }
});

