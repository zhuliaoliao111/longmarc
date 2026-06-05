// 微信小程序登录云函数 - 简版实现
exports.main = async (event, context) => {
  try {
    const { code } = event

    if (!code) {
      return {
        code: 1,
        message: '缺少登录凭证code'
      }
    }

    // 获取环境变量
    const appId = process.env.WX_APP_ID || 'wx949ade1cdfecf1a8'
    const appSecret = process.env.WX_APP_SECRET

    if (!appSecret) {
      return {
        code: 4,
        message: '服务器配置错误：未设置WX_APP_SECRET'
      }
    }

    // 使用简单的HTTP请求（不依赖wx-server-sdk）
    const https = require('https')
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`

    const tokenResponse = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = ''
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      }).on('error', reject)
    })

    // 检查响应
    if (tokenResponse.errcode) {
      return {
        code: 2,
        message: `微信接口错误: ${tokenResponse.errmsg}`
      }
    }

    if (!tokenResponse.openid) {
      return {
        code: 2,
        message: '获取openid失败'
      }
    }

    // 生成会话令牌
    const sessionToken = generateSessionToken(tokenResponse.openid, tokenResponse.session_key)

    // 返回成功结果
    return {
      code: 0,
      message: '登录成功',
      data: {
        session_token: sessionToken,
        openid: tokenResponse.openid,
        user_id: tokenResponse.openid
      }
    }

  } catch (error) {
    return {
      code: 3,
      message: '登录失败：' + error.message
    }
  }
}

// 生成会话令牌的辅助函数
function generateSessionToken(openid, sessionKey) {
  // 简单的token生成逻辑，实际项目中可以使用更复杂的方式
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substr(2, 9)
  return `${openid}_${timestamp}_${randomStr}`
}
