// 云函数：获取文物数据
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { action, artifactId } = event;

    console.log('getArtifacts云函数被调用:', { action, artifactId });

    switch (action) {
      case 'list':
        return await getArtifactsList();
      case 'detail':
        return await getArtifactDetail(artifactId);
      default:
        return {
          code: -1,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      code: -1,
      message: error.message || '服务器错误'
    };
  }
};

// 获取文物列表
async function getArtifactsList() {
  try {
    const result = await db.collection('artifacts')
      .orderBy('createTime', 'desc')
      .get();

    console.log('获取文物列表成功:', result.data.length, '个文物');

    return {
      code: 0,
      message: '获取成功',
      data: result.data
    };
  } catch (error) {
    console.error('获取文物列表失败:', error);
    return {
      code: -1,
      message: '获取文物列表失败: ' + error.message
    };
  }
}

// 获取文物详情
async function getArtifactDetail(artifactId) {
  try {
    if (!artifactId) {
      return {
        code: -1,
        message: '文物ID不能为空'
      };
    }

    const result = await db.collection('artifacts')
      .doc(artifactId)
      .get();

    if (!result.data || result.data.length === 0) {
      return {
        code: -1,
        message: '文物不存在'
      };
    }

    console.log('获取文物详情成功:', artifactId);

    return {
      code: 0,
      message: '获取成功',
      data: result.data
    };
  } catch (error) {
    console.error('获取文物详情失败:', error);
    return {
      code: -1,
      message: '获取文物详情失败: ' + error.message
    };
  }
}
