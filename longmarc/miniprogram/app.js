App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-3gt1133gaf836a9f',
        traceUser: true
      });
    }

    // 初始化图片管理器
    this.initImageManager();

    // 只检查登录状态，不强制登录
    this.checkLoginStatus();

    // 异步预加载所有图片（不阻塞应用启动）
    setTimeout(() => {
      this.preloadAllImages();
    }, 1000); // 延迟1秒开始预加载，让应用先启动完成
    console.log('登录状态检查完成，isLoggedIn:', this.globalData.isLoggedIn);
  },

  // 检查登录状态
  checkLoginStatus() {
    try {
      const sessionToken = wx.getStorageSync('session_token');
      const loginTime = wx.getStorageSync('login_time');
      const userInfo = wx.getStorageSync('userInfo');

      if (sessionToken && loginTime && userInfo) {
        // 检查登录是否过期（24小时）
        const now = Date.now();
        const loginTimestamp = new Date(loginTime).getTime();
        const expireTime = 24 * 60 * 60 * 1000; // 24小时

        if (now - loginTimestamp < expireTime) {
          // 登录未过期
          this.globalData.isLoggedIn = true;
          this.globalData.sessionToken = sessionToken;
          this.globalData.openid = wx.getStorageSync('openid');

          // 设置本地存储的用户信息作为默认值
          this.globalData.userInfo = userInfo || { nickName: '微信用户', avatarUrl: '' };

          // 尝试从云数据库获取最新的用户信息
          this.loadUserProfileFromCloud();

          // 测试数据库连接
          this.testDatabaseConnection();
        } else {
          // 登录已过期，清除数据
          this.logout();
        }
      } else {
        this.globalData.isLoggedIn = false;
      }
    } catch (e) {
      console.log('检查登录状态失败', e);
      this.globalData.isLoggedIn = false;
    }
  },

  // 登录方法
  async login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (res) => {
          if (res.code) {
            try {
              // 调用登录云函数
              console.log('开始调用登录云函数，code:', res.code);
              const loginResult = await wx.cloud.callFunction({
                name: 'login',
                data: {
                  code: res.code
                }
              });

              console.log('云函数返回结果:', loginResult);

              if (loginResult.result && loginResult.result.code === 0) {
                // 登录成功，保存登录信息
                const data = loginResult.result.data;
                console.log('登录成功，数据:', data);

                this.globalData.isLoggedIn = true;
                this.globalData.sessionToken = data.session_token;
                this.globalData.openid = data.openid;

                // 保存到本地存储
                wx.setStorageSync('session_token', data.session_token);
                wx.setStorageSync('openid', data.openid);
                wx.setStorageSync('login_time', new Date().toISOString());

                resolve(data);
              } else {
                const errorMsg = loginResult.result?.message || '登录失败';
                console.error('登录失败，云函数返回:', loginResult.result);

                // 显示具体的错误信息
                wx.showModal({
                  title: '登录失败',
                  content: errorMsg,
                  showCancel: false
                });

                reject(new Error(errorMsg));
              }

            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('获取登录凭证失败'));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  // 退出登录
  logout() {
    this.globalData.isLoggedIn = false;
    this.globalData.sessionToken = null;
    this.globalData.userInfo = null;
    this.globalData.openid = null;

    // 清除本地存储
    try {
      wx.removeStorageSync('session_token');
      wx.removeStorageSync('openid');
      wx.removeStorageSync('login_time');
      wx.removeStorageSync('userInfo');
    } catch (e) {
      console.log('清除登录信息失败', e);
    }
  },

  // 测试数据库连接（临时方法）
  testDatabaseConnection() {
    console.log('开始测试数据库连接');
    const db = wx.cloud.database();
    const collection = db.collection('user_profiles');
    const openid = this.globalData.openid;

    // 直接测试当前用户的文档是否存在
    if (openid) {
      collection.doc(openid).get().then(res => {
        console.log('数据库连接测试成功');
        console.log('当前用户文档数据:', res.data);
        if (res.data) {
          console.log('文档存在，包含字段:', Object.keys(res.data));
        } else {
          console.log('文档存在但数据为空');
        }
      }).catch(error => {
        console.error('数据库连接测试失败:', error);
        if (error.errCode === -1) {
          console.log('文档不存在，这是正常的，新用户');
        }
      });
    } else {
      console.log('没有openid，无法测试数据库连接');
    }
  },

  // 从云数据库加载用户资料
  loadUserProfileFromCloud() {
    const openid = this.globalData.openid;
    console.log('开始加载云端用户资料，openid:', openid);

    if (!openid) {
      console.log('没有openid，无法加载云端用户资料');
      return;
    }

    const db = wx.cloud.database();
    const collection = db.collection('user_profiles');
    console.log('准备查询user_profiles集合，openid:', openid);

    // 直接用openid作为文档ID查询（与保存方式一致）
    collection.doc(openid).get().then(res => {
      console.log('云数据库查询结果:', res);
      console.log('查询到的数据:', res.data);

      if (res.data && res.data.nickName) {
        // 更新全局数据和本地存储
        // 如果avatarUrl是临时文件路径（wxfile://），则设置为空字符串
        let avatarUrl = res.data.avatarUrl || '';
        if (avatarUrl.startsWith('wxfile://')) {
          avatarUrl = ''; // 临时文件路径无效，设置为空
        }

        const cloudUserInfo = {
          nickName: res.data.nickName,
          avatarUrl: avatarUrl
        };
        console.log('准备更新用户信息:', cloudUserInfo);

        this.globalData.userInfo = cloudUserInfo;
        wx.setStorageSync('userInfo', cloudUserInfo);

        console.log('用户信息更新完成，全局数据:', this.globalData.userInfo);
        console.log('本地存储更新完成:', wx.getStorageSync('userInfo'));

        // 显示成功提示
        wx.showToast({
          title: '已加载用户资料',
          icon: 'success',
          duration: 1500
        });
      } else {
        console.log('云数据库中没有用户资料或nickName为空，使用本地默认值');
        console.log('res.data是否存在:', !!res.data);
        if (res.data) {
          console.log('res.data内容:', res.data);
        }
      }
    }).catch(error => {
      console.error('从云数据库加载用户资料失败，错误详情:', error);
      console.error('错误代码:', error.errCode);
      console.error('错误信息:', error.errMsg);

      // 检查是否是集合不存在的错误
      if (error.errCode === -502005) {
        console.log('user_profiles集合不存在，这是正常的，新用户还没有创建过资料');
      } else if (error.errCode === -1) {
        console.log('文档不存在，这是正常的，新用户还没有创建过资料');
      } else {
        console.error('从云数据库加载用户资料失败:', error);
      }
      // 失败时使用本地存储的数据
    });
  },

  // 强制登录方法
  async forceLogin() {
    console.log('执行forceLogin方法');
    return new Promise(async (resolve, reject) => {
      try {
        wx.showModal({
          title: '登录提示',
          content: '使用本应用需要先登录并授权获取您的微信信息和运动数据',
          showCancel: false,
          confirmText: '立即登录',
          success: async () => {
            console.log('用户点击立即登录，开始执行performFullLogin');
            await this.performFullLogin();
            console.log('performFullLogin执行完成');
            resolve();
          }
        });
      } catch (error) {
        console.error('强制登录失败:', error);
        reject(error);
      }
    });
  },

  // 执行完整的登录流程
  async performFullLogin() {
    return new Promise(async (resolve, reject) => {
      try {
        wx.showLoading({
          title: '登录中...'
        });

        // 步骤1: 微信登录获取code
        const loginResult = await this.login();
        console.log('基础登录成功');

        wx.hideLoading();

        // 步骤2: 跳转到用户设置页面，让用户设置头像和昵称
        console.log('显示设置提示，开始跳转');
        wx.showToast({
          title: '请设置头像和昵称',
          icon: 'none',
          duration: 2000
        });

        // 延迟跳转到用户设置页面
        setTimeout(() => {
          console.log('开始跳转到用户设置页面');
          wx.navigateTo({
            url: '/pages/user-setup/user-setup',
            success: () => {
              console.log('跳转到用户设置页面成功');
              resolve(); // 完成登录流程
            },
            fail: (error) => {
              console.error('跳转到用户设置页面失败:', error);
              reject(error);
            }
          });
        }, 1500);

      } catch (error) {
        wx.hideLoading();
        console.error('完整登录流程失败:', error);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
        reject(error);
      }
    });
  },

  // 初始化图片管理器
  async initImageManager() {
    try {
      console.log('开始初始化图片管理器...');
      const imageManager = require('./utils/imageManager.js');
      await imageManager.init();

      // 将图片管理器添加到全局数据中，供其他页面使用
      this.globalData.imageManager = imageManager;
      console.log('图片管理器初始化完成');
    } catch (error) {
      console.error('图片管理器初始化失败:', error);
    }
  },

  // 预加载所有图片
  async preloadAllImages() {
    try {
      console.log('开始预加载所有图片...');
      if (this.globalData.imageManager) {
        await this.globalData.imageManager.preloadAllImages();
        console.log('所有图片预加载完成');
      } else {
        console.log('图片管理器未初始化，跳过预加载');
      }
    } catch (error) {
      console.log('预加载所有图片失败:', error.message);
    }
  },

  // 获取图片URL的全局方法
  async getImageUrl(imageName) {
    if (this.globalData.imageManager) {
      const url = await this.globalData.imageManager.getImageUrl(imageName);
      if (url && url.includes('cloud://')) {
        console.log(`✅ 获取图片URL成功: ${imageName}`);
        return url;
      } else {
        console.log(`❌ 获取图片URL失败，使用fallback: ${imageName}`);
        return `cloud://cloud1-3gt1133gaf836a9f.636c-cloud1-3gt1133gaf836a9f-1379245070/images/${imageName}`;
      }
    }
    // fallback到云存储路径
    console.log(`⚠️ 图片管理器未初始化，使用fallback: ${imageName}`);
    return `cloud://cloud1-3gt1133gaf836a9f.636c-cloud1-3gt1133gaf836a9f-1379245070/images/${imageName}`;
  },

  globalData: {
    isLoggedIn: false,
    sessionToken: null,
    userInfo: null,
    openid: null,
    imageManager: null
  }
}); 