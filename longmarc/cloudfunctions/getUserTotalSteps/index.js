// 云函数：获取用户的总步数和公里数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const db = cloud.database()

    // 查询用户的总步数记录
    const result = await db.collection('user_total_steps')
      .where({
        userId: openid
      })
      .get()

    if (result.data && result.data.length > 0) {
      const userData = result.data[0]

      // 计算长征总里程：步数公里数×20 + 运动公里数×40
      const totalKm = Number(userData.totalKm || 0);
      const exerciseTotalKm = Number(userData.exerciseTotalKm || 0);
      const totalScore = (totalKm * 20 + exerciseTotalKm * 40).toFixed(2);

      return {
        code: 0,
        message: '获取成功',
        data: {
          totalSteps: userData.totalSteps || 0,
          totalKm: totalKm,
          exerciseTotalKm: exerciseTotalKm,
          totalScore: totalScore, // 综合得分
          lastUpdated: userData.lastUpdated
        }
      }
    } else {
      // 用户还没有步数记录，返回默认值
      return {
        code: 0,
        message: '用户暂无步数记录',
        data: {
          totalSteps: 0,
          totalKm: 0, // 微信步数转换的公里数
          exerciseTotalKm: 0, // 运动轨迹总公里数
          totalScore: 0, // 综合得分
          lastUpdated: null
        }
      }
    }

  } catch (error) {
    console.error('获取用户总步数失败:', error)

    return {
      code: -1,
      message: '获取失败',
      error: error.message
    }
  }
}
