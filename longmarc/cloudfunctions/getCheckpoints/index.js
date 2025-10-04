exports.main = async (event, context) => {
  const checkpoints = [
    // 重要历史节点（显示红旗和标签）
    {
      name: '瑞金出发', latitude: 25.885, longitude: 116.027, date: '1934-10-16',
      description: '中央红军从瑞金出发，开始长征。',
      cover: 'https://static.example.com/longmarch/ruijin.jpg',
      gallery: [
        'https://static.example.com/longmarch/ruijin-1.jpg',
        'https://static.example.com/longmarch/ruijin-2.jpg'
      ],
      content: [
        '1934年10月，中央红军从江西瑞金出发，踏上了艰苦卓绝的战略大转移。',
        '面对敌军的围追堵截，红军指战员以坚定的革命理想和钢铁般的纪律迈出第一步。'
      ],
      isMajorNode: true
    },
    // 瑞金到湘江的中间路线节点
    { name: '于都', latitude: 25.95, longitude: 115.39, isMajorNode: false },
    { name: '信丰', latitude: 25.39, longitude: 114.93, isMajorNode: false },
    { name: '汝城', latitude: 25.54, longitude: 113.69, isMajorNode: false },
    { name: '宜章', latitude: 25.40, longitude: 113.04, isMajorNode: false },
    { name: '道县', latitude: 25.52, longitude: 111.59, isMajorNode: false },
    {
      name: '湘江战役', latitude: 25.6, longitude: 110.0, date: '1934-11-25',
      description: '在湘江进行激烈阻击战。',
      cover: 'https://static.example.com/longmarch/xiangjiang.jpg',
      gallery: [
        'https://static.example.com/longmarch/xiangjiang-1.jpg'
      ],
      content: [
        '湘江一线，红军与敌军展开惨烈阻击。为保存有生力量，众多指战员献出了宝贵生命。',
        '这场战役虽付出沉重代价，却为后续战略转移赢得了时间。'
      ],
      isMajorNode: true
    },
    // 湘江到遵义的中间路线节点
    { name: '全州', latitude: 25.93, longitude: 111.07, isMajorNode: false },
    { name: '龙胜', latitude: 25.79, longitude: 110.01, isMajorNode: false },
    { name: '黎平', latitude: 26.23, longitude: 109.14, isMajorNode: false },
    { name: '黄平', latitude: 26.90, longitude: 107.90, isMajorNode: false },
    {
      name: '遵义会议', latitude: 27.73, longitude: 106.93, date: '1935-01-15',
      description: '召开具有重大历史意义的遵义会议。',
      cover: 'https://static.example.com/longmarch/zunyi.jpg',
      gallery: [
        'https://static.example.com/longmarch/zunyi-1.jpg',
        'https://static.example.com/longmarch/zunyi-2.jpg'
      ],
      content: [
        '遵义会议确立了新的中央领导集体，开启了中国革命走向胜利的转折。',
        '会议从实际出发，纠正了"左"倾冒险主义的错误路线，奠定了独立自主解决中国革命问题的思想基础。'
      ],
      isMajorNode: true
    },
    // 遵义到四渡赤水的中间路线节点
    { name: '习水', latitude: 28.33, longitude: 106.20, isMajorNode: false },
    { name: '古蔺', latitude: 28.04, longitude: 105.81, isMajorNode: false },
    {
      name: '四渡赤水', latitude: 28.6, longitude: 105.7, date: '1935-03-10',
      description: '在川黔边界地区四渡赤水河。',
      cover: 'https://static.example.com/longmarch/chishui.jpg',
      gallery: [
        'https://static.example.com/longmarch/chishui-1.jpg'
      ],
      content: [
        '四渡赤水用兵如神，灵活机动地摆脱了强敌围追，成为军事史上的经典战例。',
        '赤水河畔，红军凭借卓越的指挥和严格的保密，出奇制胜。'
      ],
      isMajorNode: true
    },
    // 四渡赤水到强渡大渡河的中间路线节点
    { name: '毕节', latitude: 27.30, longitude: 105.29, isMajorNode: false },
    { name: '威信', latitude: 27.84, longitude: 105.05, isMajorNode: false },
    { name: '巧家', latitude: 26.91, longitude: 102.93, isMajorNode: false },
    { name: '西昌', latitude: 27.90, longitude: 102.26, isMajorNode: false },
    {
      name: '强渡大渡河', latitude: 29.35, longitude: 102.72, date: '1935-05-29',
      description: '强渡大渡河，夺取战略主动。',
      cover: 'https://static.example.com/longmarch/daduhe.jpg',
      gallery: [
        'https://static.example.com/longmarch/daduhe-1.jpg'
      ],
      content: [
        '在天险大渡河上，红军组织船只强渡，为夺取泸定桥创造了条件。',
        '强渡行动迅速果断，展现了红军英勇无畏的革命精神。'
      ],
      isMajorNode: true
    },
    // 强渡大渡河到飞夺泸定桥的中间路线节点
    { name: '磨西', latitude: 29.65, longitude: 102.35, isMajorNode: false },
    {
      name: '飞夺泸定桥', latitude: 29.912, longitude: 102.233, date: '1935-05-29',
      description: '二十二名勇士在铁索桥上奋勇前进，成功夺取泸定桥。',
      cover: 'https://static.example.com/longmarch/luding.jpg',
      gallery: [
        'https://static.example.com/longmarch/luding-1.jpg',
        'https://static.example.com/longmarch/luding-2.jpg'
      ],
      content: [
        '为夺取北上通道，红军突击队在枪林弹雨中沿铁索匍匐前进，抢占桥头堡。',
        '泸定桥之役以惊心动魄的英勇，成为长征精神的生动注脚。',
        '胜利夺桥后，红军得以迅速过江，继续向北挺进。'
      ],
      isMajorNode: true
    },
    // 飞夺泸定桥到翻越夹金山的中间路线节点
    { name: '天全', latitude: 30.07, longitude: 102.76, isMajorNode: false },
    { name: '宝兴', latitude: 30.37, longitude: 102.84, isMajorNode: false },
    {
      name: '翻越夹金山', latitude: 30.4, longitude: 102.98, date: '1935-06-12',
      description: '翻越海拔4000多米的夹金山。',
      cover: 'https://static.example.com/longmarch/jiajinshan.jpg',
      gallery: [
        'https://static.example.com/longmarch/jiajinshan-1.jpg'
      ],
      content: [
        '严寒缺氧、风雪交加，红军在极端艰苦的自然条件下翻越夹金山。',
        '战士们以顽强意志战胜自然，继续向北推进。'
      ],
      isMajorNode: true
    },
    // 翻越夹金山到腊子口的中间路线节点
    { name: '懋功', latitude: 30.99, longitude: 102.36, isMajorNode: false },
    { name: '毛儿盖', latitude: 32.51, longitude: 103.05, isMajorNode: false },
    { name: '班佑', latitude: 33.12, longitude: 103.18, isMajorNode: false },
    { name: '俄界', latitude: 33.55, longitude: 103.48, isMajorNode: false },
    {
      name: '腊子口战役', latitude: 34.61, longitude: 103.21, date: '1935-09-16',
      description: '突破天险腊子口。',
      cover: 'https://static.example.com/longmarch/lazikou.jpg',
      gallery: [
        'https://static.example.com/longmarch/lazikou-1.jpg'
      ],
      content: [
        '腊子口易守难攻，红军采用迂回突击等战术，最终突破天险。',
        '这场胜利为继续北上打开通路。'
      ],
      isMajorNode: true
    },
    // 腊子口到会宁会师的中间路线节点
    { name: '哈达铺', latitude: 34.48, longitude: 104.17, isMajorNode: false },
    { name: '天水', latitude: 34.58, longitude: 105.73, isMajorNode: false },
    { name: '通渭', latitude: 35.21, longitude: 105.24, isMajorNode: false },
    { name: '静宁', latitude: 35.52, longitude: 105.73, isMajorNode: false },
    {
      name: '会宁会师', latitude: 35.7, longitude: 105.05, date: '1936-10-09',
      description: '红军三大主力在会宁会师，长征胜利结束。',
      cover: 'https://static.example.com/longmarch/huining.jpg',
      gallery: [
        'https://static.example.com/longmarch/huining-1.jpg'
      ],
      content: [
        '红一、红二、红四方面军在会宁胜利会师，标志着长征的胜利完成。',
        '会宁会师凝聚了极不平凡的万里征程与不屈不挠的革命精神。'
      ],
      isMajorNode: true
    }
  ];

  return { code: 0, data: checkpoints };
}; 