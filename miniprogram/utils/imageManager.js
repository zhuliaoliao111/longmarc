// 图片管理工具 - 处理图片上传到云存储和从云数据库获取
class ImageManager {
  constructor() {
    this.imageCache = {}; // 图片URL缓存
    this.isInitialized = false;
  }

  // 初始化 - 简化版本，不依赖数据库
  async init() {
    if (this.isInitialized) return;

    try {
      console.log('初始化图片管理器...');
      // 简化初始化，不再从数据库获取所有图片URL
      // 改为按需获取，避免数据库依赖问题
      this.isInitialized = true;
      console.log('图片管理器初始化成功（简化模式）');
    } catch (error) {
      console.error('图片管理器初始化异常:', error);
      // 即使初始化失败，也标记为已初始化，使用fallback机制
      this.isInitialized = true;
    }
  }

  // 预加载所有图片（分批次加载，优化性能）
  async preloadAllImages() {
    // 按优先级分组图片
    const imageGroups = {
      // 高优先级 - 关键UI和常用图片
      high: [
        '用户.png', '背景.png', '对话.png', '地图.jpg',
        'start-marker.png', 'marker-reached.png', 'marker-locked.png',
        '扬声器.png', '暂停.png', '太阳.png', '月亮.png'
      ],

      // 中优先级 - Challenge页面图片（用户最先看到的）
      medium: [
        '以笔绘长征.jpg', '以字忆长征.jpg', '以心看长征.jpg',
        '诗词书法.jpg', '文生文.jpg', '文生图.jpg', '军民鱼水情.jpg'
      ],

      // 低优先级 - 其他页面图片
      low: [
        '文物.png', '日记.png', '画板.png', '跑步.png',
        '用户页背景.jpg', '轨迹背景.jpg',
        '瑞金出发.jpg', '湘江.jpg', '遵义会议.jpg', '四渡赤水.jpg',
        '强渡大渡河.jpg', '泸定桥.jpg', '夹金山.jpg', '腊子口战役.jpg', '会宁会师.jpg',
        '离开苏区上征途.jpg', '周副主席到我团.jpg', '八过赤水甩敌人.jpg',
        '毛儿盖见朱总司令.jpg', '决战山城堡再上新征途.jpg',
        '瑞金出发_图标.jpg', '湘江战役_图标.jpg', '遵义会议_图标.jpg',
        '四渡赤水_图标.jpg', '强渡大渡河_图标.jpg', '飞夺泸定桥_图标.jpg',
        '翻越夹金山_图标.jpg', '腊子口战役_图标.jpg', '会宁会师_图标.jpg',
        '八角帽.jpg', '标语牌.jpg', '草鞋.jpg', '藤饭碗.jpg', '防寒衣.jpg', '银元.jpg',
        '毛泽东.jpg', '周恩来.jpg', '朱德.jpg', '李明远.jpg',
        '暂停1.png', '语音播放-.png', '设置.png', '目录.png',
        '语音回忆录.jpg', '梅花.png', '封面.jpg', '填写资料.jpg',
        '登录.jpg', '首页.jpg', '三艘小船.jpg', '跨时空对话.jpg',
        '会宁会师_主页.jpg', '四渡赤水_主页.jpg', '翻越夹金山_主页.jpg',
        '飞夺泸定桥_主页.jpg', '胜利会师_主页.jpg',
        '我.jpg',
        // Poetry Cards 详细图片
        '七律铁血军魂.jpg', '沁园春长沙.jpg', '沁园春雪.jpg',
        '清平乐.jpg', '清平乐会昌.jpg', '清平乐六盘山.jpg',
        '渔家傲 反第一次大围剿.jpg'
      ]
    };

    console.log('开始分批预加载图片...');

    // 预加载高优先级图片（立即开始）
    await this.preloadImageBatch(imageGroups.high, '高优先级');

    // 延迟加载中优先级图片
    setTimeout(async () => {
      await this.preloadImageBatch(imageGroups.medium, '中优先级');
    }, 500);

    // 延迟加载低优先级图片
    setTimeout(async () => {
      await this.preloadImageBatch(imageGroups.low, '低优先级');
    }, 1500);
  }

  // 预加载图片批次
  async preloadImageBatch(imageNames, priority) {
    console.log(`开始预加载${priority}图片，共 ${imageNames.length} 张...`);

    try {
      const startTime = Date.now();

      // 控制并发数量，避免过多并发请求
      const batchSize = 10;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < imageNames.length; i += batchSize) {
        const batch = imageNames.slice(i, i + batchSize);

        const batchPromises = batch.map(async (imageName) => {
          const imageStartTime = Date.now();
          try {
            await this.getImageUrl(imageName);
            const loadTime = Date.now() - imageStartTime;
            return { imageName, success: true, loadTime };
          } catch (error) {
            const loadTime = Date.now() - imageStartTime;
            return { imageName, success: false, error: error.message, loadTime };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
          } else {
            failCount++;
            if (priority === '高优先级') {
              console.log(`❌ ${priority}图片预加载失败: ${result.value?.imageName || '未知'}`, result.reason || result.value?.error);
            }
          }
        });

        // 批次间暂停，避免过于频繁的请求
        if (i + batchSize < imageNames.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const totalTime = Date.now() - startTime;
      const totalImages = imageNames.length;

      console.log(`✅ ${priority}图片预加载完成 - 成功: ${successCount}/${totalImages}, 失败: ${failCount}, 总耗时: ${totalTime}ms`);

      // 如果高优先级图片失败率过高，给出警告
      if (priority === '高优先级' && failCount > successCount * 0.2) {
        console.warn(`⚠️ ${priority}图片预加载失败率较高，请检查网络连接`);
      }

    } catch (error) {
      console.error(`❌ ${priority}图片预加载过程出现异常:`, error.message);
    }
  }

  // 预加载页面特定图片
  async preloadPageImages(imageNames) {
    console.log('开始预加载页面图片:', imageNames);

    try {
      const preloadPromises = imageNames.map(async (imageName) => {
        try {
          const url = await this.getImageUrl(imageName);
          return { imageName, url };
        } catch (error) {
          console.log(`页面图片预加载失败: ${imageName}`, error.message);
          return { imageName, url: null };
        }
      });

      const results = await Promise.allSettled(preloadPromises);
      const imageUrls = {};

      results.forEach((result, index) => {
        const imageName = imageNames[index];
        if (result.status === 'fulfilled' && result.value.url) {
          // 将图片名转换为驼峰式变量名
          const varName = this.imageNameToVarName(imageName);
          imageUrls[varName] = result.value.url;
        }
      });

      console.log('页面图片预加载完成');
      return imageUrls;
    } catch (error) {
      console.log('页面图片预加载异常:', error.message);
      return {};
    }
  }

  // 将图片名转换为驼峰式变量名
  imageNameToVarName(imageName) {
    // 移除扩展名，然后转换为驼峰式
    const nameWithoutExt = imageName.replace(/\.(jpg|png|gif|jpeg)$/i, '');
    // 处理中文和特殊字符
    return nameWithoutExt
      .replace(/[^\w\s]/g, '') // 移除特殊字符
      .replace(/\s+/g, '') // 移除空格
      .replace(/^./, str => str.toLowerCase()); // 首字母小写
  }

  // 获取图片URL - 优先使用本地图片
  async getImageUrl(imageName) {
    // 本地图片列表 - 这些图片优先使用本地路径
    const localImages = [
      '用户.png', '背景.png', '对话.png', '地图.jpg',
      '红旗.png',
      '文物.png', '日记.png', '画板.png', '跑步.png',
      '瑞金出发.jpg', '湘江.jpg', '遵义会议.jpg', '四渡赤水.jpg',
      '强渡大渡河.jpg', '泸定桥.jpg', '夹金山.jpg', '腊子口战役.jpg', '会宁会师.jpg'
    ];

    // 如果是本地图片，直接返回本地路径
    if (localImages.includes(imageName)) {
      const localPath = `/images/index/${imageName}`;
      // 缓存本地路径
      if (!this.imageCache[imageName]) {
        this.imageCache[imageName] = {};
      }
      this.imageCache[imageName].url = localPath;
      console.log('使用本地图片路径:', imageName, localPath);
      return localPath;
    }

    // 如果缓存中存在，直接返回
    if (this.imageCache[imageName] && this.imageCache[imageName].url) {
      return this.imageCache[imageName].url;
    }

    // 从云数据库获取（如果可用）
    try {
      const result = await wx.cloud.callFunction({
        name: 'uploadImages',
        data: {
          action: 'getImageUrl',
          imageName: imageName
        }
      });

      if (result.result.code === 0) {
        const url = result.result.data.url;
        // 缓存URL
        if (!this.imageCache[imageName]) {
          this.imageCache[imageName] = {};
        }
        this.imageCache[imageName].url = url;
        console.log('从数据库获取图片URL成功:', imageName);
        return url;
      } else {
        console.log('数据库中未找到图片，使用云存储路径:', imageName);
      }
    } catch (error) {
      console.log('数据库不可用，使用云存储路径:', imageName, '(错误:', error.message, ')');
    }

    // 返回云存储路径作为fallback
    return `cloud://cloud1-3gt1133gaf836a9f.636c-cloud1-3gt1133gaf836a9f-1379245070/images/${imageName}`;
  }

  // 上传单张图片 - 暂时禁用，避免路径错误
  async uploadImage(imageName) {
    console.log('图片上传功能暂时不可用:', imageName);
    throw new Error('图片上传功能暂时不可用，请直接使用云存储中的图片');
  }

  // 批量上传所有图片 - 暂时禁用
  async uploadAllImages() {
    console.log('批量上传功能暂时不可用，所有图片已存储在云存储中');
    wx.showModal({
      title: '功能不可用',
      content: '批量上传功能暂时不可用，所有图片已存储在云存储中',
      showCancel: false
    });
    return [];
  }

  // 清除缓存
  clearCache() {
    this.imageCache = {};
    this.isInitialized = false;
  }

  // 获取缓存统计信息
  getCacheStats() {
    return {
      cachedCount: Object.keys(this.imageCache).length,
      isInitialized: this.isInitialized
    };
  }
}

// 创建全局实例
const imageManager = new ImageManager();

module.exports = imageManager;
