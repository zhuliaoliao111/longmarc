const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    theme: wx.getSystemInfoSync().theme,
    backgroundImgUrl: ''
  },

  /**
   * 头像选择回调
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    console.log('选择的头像URL:', avatarUrl)
    this.setData({
      avatarUrl,
    })
    // 暂时存储到页面数据，提交时再保存到全局
  },

  /**
   * 表单提交
   */
  async formSubmit(e) {
    const { nickname } = e.detail.value
    const { avatarUrl } = this.data

    if (!nickname || nickname.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...'
    })

    try {
      // 获取用户openid
      const openid = app.globalData.openid || wx.getStorageSync('openid')
      if (!openid) {
        wx.hideLoading()
        wx.showToast({
          title: '用户未登录',
          icon: 'none'
        })
        return
      }

      let finalAvatarUrl = ''

      // 如果用户选择了头像，上传到云存储
      if (avatarUrl && avatarUrl !== defaultAvatarUrl && !avatarUrl.startsWith('http')) {
        console.log('检测到用户选择的头像，开始上传到云存储')
        finalAvatarUrl = await this.uploadAvatarToCloud(avatarUrl, openid)
      }

      // 准备保存的用户信息
      const userInfo = {
        openid: openid,
        nickName: nickname.trim(),
        avatarUrl: finalAvatarUrl, // 保存云存储URL或空字符串
        updateTime: new Date().getTime()
      }

      console.log('准备保存的用户信息:', userInfo)

      // 保存到本地存储（快速响应）
      app.globalData.userInfo = {
        nickName: userInfo.nickName,
        avatarUrl: finalAvatarUrl
      }
      wx.setStorageSync('userInfo', app.globalData.userInfo)

      // 保存到云数据库
      const db = wx.cloud.database()
      const collection = db.collection('user_profiles')
      console.log('准备保存到云数据库，openid:', openid)

      await collection.doc(openid).set({
        data: userInfo
      })

      console.log('保存到云数据库成功')
      wx.hideLoading()
      
      // 设置登录状态为已完成（移除重复声明）
      app.globalData.isLoggedIn = true
      
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      })

      // 跳转到个人信息详情页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user-home/user-home'
        })
      }, 1500)

    } catch (error) {
      console.error('保存用户信息失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '设置失败，请重试',
        icon: 'none'
      })
    }
  },

  /**
   * 上传头像到云存储
   */
  async uploadAvatarToCloud(avatarUrl, openid) {
    return new Promise((resolve, reject) => {
      // 生成云存储文件路径
      const cloudPath = `user_avatars/${openid}_${Date.now()}.jpg`

      console.log('开始上传头像到云存储:', cloudPath)

      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: avatarUrl, // 微信临时文件路径
        success: (res) => {
          console.log('头像上传成功:', res.fileID)
          resolve(res.fileID) // 返回云存储的文件ID
        },
        fail: (error) => {
          console.error('头像上传失败:', error)
          // 上传失败时返回空字符串，不影响整体流程
          resolve('')
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    console.log('用户设置页面onLoad被调用');

    // 异步获取背景图片URL
    const backgroundImgUrl = await getApp().getImageUrl('填写资料.jpg');
    this.setData({
      backgroundImgUrl: backgroundImgUrl
    });

    wx.onThemeChange((result) => {
      this.setData({
        theme: result.theme
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('用户设置页面onShow被调用');
    // 页面显示时可以添加其他逻辑
  },

  /**
   * 跳过设置
   */
  skipSetup() {
    wx.showModal({
      title: '跳过设置',
      content: '确定要跳过个人资料设置吗？以后可以在个人资料页面重新设置。',
      success: (res) => {
        if (res.confirm) {
          // 设置默认信息
          const defaultUserInfo = {
            nickName: '微信用户',
            avatarUrl: ''
          }
          app.globalData.userInfo = defaultUserInfo
          wx.setStorageSync('userInfo', defaultUserInfo)

          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  }
})
