// 微信运动步数数据处理云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { weRunData } = event || {};

    // 检查是否提供了 WeRun 数据
    if (!weRunData || !weRunData.data) {
      return {
        code: 1,
        message: '未提供微信运动数据'
      };
    }

    const weRunStepData = weRunData.data;

    // 验证数据格式
    if (!weRunStepData.stepInfoList || !Array.isArray(weRunStepData.stepInfoList)) {
      return {
        code: 2,
        message: '微信运动数据格式错误'
      };
    }

    // 处理步数数据
    const stepInfoList = weRunStepData.stepInfoList;

    // 获取昨天步数
    const yesterdaySteps = getYesterdaySteps(stepInfoList);

    // 获取最近30天的步数统计
    const monthlySteps = getMonthlySteps(stepInfoList);

    // 获取总步数
    const totalSteps = getTotalSteps(stepInfoList);

    // 获取当前用户信息
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    if (!openid) {
      console.log('无法获取用户openid');
      return {
        code: 4,
        message: '用户未登录'
      };
    }

    // 更新用户步数记录到数据库
    const db = cloud.database();
    const userStepsCollection = db.collection('user_steps');

    try {
      // 计算最近30天的累加总步数
      let cumulativeTotalSteps = 0;
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 获取用户已记录的步数日期
      const existingRecords = await userStepsCollection.where({
        openid: openid,
        date: db.command.gte(thirtyDaysAgo.toISOString().split('T')[0]) // 日期格式 YYYY-MM-DD
      }).get();

      const recordedDates = new Set(existingRecords.data.map(record => record.date));

      // 为每个月度数据创建或更新记录
      for (const dayData of monthlySteps) {
        const dateStr = new Date(dayData.date).toISOString().split('T')[0]; // 转换为YYYY-MM-DD格式

        if (!recordedDates.has(dateStr)) {
          // 新日期，添加记录
          await userStepsCollection.add({
            data: {
              openid: openid,
              date: dateStr,
              steps: dayData.steps,
              timestamp: new Date().getTime()
            }
          });
          cumulativeTotalSteps += dayData.steps;
        }
      }

      // 如果有新累加的步数，更新用户的总步数
      if (cumulativeTotalSteps > 0) {
        const userTotalCollection = db.collection('user_total_steps');
        const existingTotal = await userTotalCollection.where({
          openid: openid
        }).get();

        if (existingTotal.data.length === 0) {
          // 新用户，创建总步数记录
          await userTotalCollection.add({
            data: {
              openid: openid,
              totalSteps: cumulativeTotalSteps,
              lastUpdated: new Date().getTime()
            }
          });
        } else {
          // 现有用户，累加总步数
          const currentTotal = existingTotal.data[0].totalSteps || 0;
          await userTotalCollection.where({
            openid: openid
          }).update({
            data: {
              totalSteps: currentTotal + cumulativeTotalSteps,
              lastUpdated: new Date().getTime()
            }
          });
        }
      }

      console.log(`用户 ${openid} 累加步数: ${cumulativeTotalSteps}`);

    } catch (dbError) {
      console.error('数据库操作失败:', dbError);
      // 数据库操作失败不影响主要功能，继续返回数据
    }

    // 构造返回数据
    const result = {
      code: 0,
      message: '获取步数数据成功',
      data: {
        yesterdaySteps: yesterdaySteps,
        monthlySteps: monthlySteps,
        totalSteps: totalSteps,
        stepInfoList: stepInfoList, // 保留原始数据以供前端使用
        timestamp: new Date().getTime()
      }
    };

    return result;

  } catch (error) {
    console.error('处理微信运动数据失败：', error);
    return {
      code: 3,
      message: '服务器错误：' + error.message
    };
  }
};

// 获取昨天步数（完整一天）
function getYesterdaySteps(stepInfoList) {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000); // 昨天
  const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime() / 1000;
  const endOfYesterday = startOfYesterday + 86400; // 昨天24小时

  let yesterdaySteps = 0;
  stepInfoList.forEach(item => {
    if (item.timestamp >= startOfYesterday && item.timestamp < endOfYesterday) {
      yesterdaySteps = item.step; // 使用最后一次记录作为昨天步数
    }
  });
  console.log('计算昨天步数:', yesterdaySteps);
  return yesterdaySteps;
}

// 获取最近30天的步数统计（每天的最大步数）
function getMonthlySteps(stepInfoList) {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthAgoTimestamp = monthAgo.getTime() / 1000;

  const monthlyData = [];

  // 按日期分组统计
  const dailySteps = {};
  for (const item of stepInfoList) {
    if (item.timestamp >= monthAgoTimestamp) {
      const date = new Date(item.timestamp * 1000).toDateString();
      if (!dailySteps[date] || item.step > dailySteps[date]) {
        dailySteps[date] = item.step || 0;
      }
    }
  }

  // 转换为数组格式
  for (const [date, steps] of Object.entries(dailySteps)) {
    monthlyData.push({
      date: date,
      steps: steps
    });
  }

  // 按日期排序（最新的在前面）
  monthlyData.sort((a, b) => new Date(b.date) - new Date(a.date));

  return monthlyData;
}

// 获取总步数（最近30天的累计）
function getTotalSteps(stepInfoList) {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthAgoTimestamp = monthAgo.getTime() / 1000;

  const dailySteps = {};

  // 按日期分组，获取每天的最大步数
  for (const item of stepInfoList) {
    if (item.timestamp >= monthAgoTimestamp) {
      const date = new Date(item.timestamp * 1000).toDateString();
      if (!dailySteps[date] || item.step > dailySteps[date]) {
        dailySteps[date] = item.step || 0;
      }
    }
  }

  // 计算总步数
  let totalSteps = 0;
  for (const steps of Object.values(dailySteps)) {
    totalSteps += steps;
  }

  return totalSteps;
} 