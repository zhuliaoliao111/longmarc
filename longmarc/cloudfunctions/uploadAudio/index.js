// 云函数：音频文件上传和管理
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 音频文件配置
const AUDIO_FILES = {
  'bjm.mp3': { name: '八角帽音频', description: '关于八角帽的历史介绍音频' },
  'byp.mp3': { name: '菠萝叶盘音频', description: '关于菠萝叶盘的历史介绍音频' },
  'cx.mp3': { name: '草鞋音频', description: '关于草鞋的历史介绍音频' },
  'fhy.mp3': { name: '防寒衣音频', description: '关于防寒衣的历史介绍音频' },
  'tfw.mp3': { name: '藤饭碗音频', description: '关于藤饭碗的历史介绍音频' },
  'yy.mp3': { name: '银元音频', description: '关于银元的历史介绍音频' }
};

// 上传音频文件到云存储
exports.main = async (event, context) => {
  const { action, fileName } = event;

  try {
    switch (action) {
      case 'upload':
        return await uploadAudioFile(event);
      case 'getUrl':
        return await getAudioUrl(event);
      case 'list':
        return await listAudioFiles();
      default:
        return {
          code: -1,
          message: '未知操作'
        };
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      code: -1,
      message: error.message || '云函数执行失败'
    };
  }
};

// 上传音频文件
async function uploadAudioFile(event) {
  const { fileName, fileBuffer } = event;

  if (!fileName || !fileBuffer) {
    return {
      code: -1,
      message: '文件名和文件数据不能为空'
    };
  }

  try {
    // 上传文件到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: `audio/${fileName}`,
      fileContent: Buffer.from(fileBuffer, 'base64')
    });

    // 保存文件信息到数据库
    const audioInfo = AUDIO_FILES[fileName] || {
      name: fileName,
      description: '音频文件'
    };

    await db.collection('audio_files').add({
      data: {
        fileName,
        cloudPath: uploadResult.fileID,
        ...audioInfo,
        uploadTime: new Date(),
        size: fileBuffer.length
      }
    });

    return {
      code: 0,
      message: '上传成功',
      data: {
        fileID: uploadResult.fileID,
        fileName
      }
    };

  } catch (error) {
    console.error('上传失败:', error);
    return {
      code: -1,
      message: '上传失败: ' + error.message
    };
  }
}

// 获取音频文件URL
async function getAudioUrl(event) {
  const { fileName } = event;

  if (!fileName) {
    return {
      code: -1,
      message: '文件名不能为空'
    };
  }

  try {
    // 从数据库查询文件信息
    const queryResult = await db.collection('audio_files')
      .where({
        fileName: fileName
      })
      .get();

    if (queryResult.data.length === 0) {
      return {
        code: -1,
        message: '音频文件不存在'
      };
    }

    const fileInfo = queryResult.data[0];

    // 获取临时访问链接
    const tempUrlResult = await cloud.getTempFileURL({
      fileList: [fileInfo.cloudPath]
    });

    if (tempUrlResult.fileList.length === 0) {
      return {
        code: -1,
        message: '获取文件URL失败'
      };
    }

    return {
      code: 0,
      message: '获取成功',
      data: {
        url: tempUrlResult.fileList[0].tempFileURL,
        fileName,
        info: fileInfo
      }
    };

  } catch (error) {
    console.error('获取URL失败:', error);
    return {
      code: -1,
      message: '获取URL失败: ' + error.message
    };
  }
}

// 列出所有音频文件
async function listAudioFiles() {
  try {
    const result = await db.collection('audio_files')
      .orderBy('uploadTime', 'desc')
      .get();

    return {
      code: 0,
      message: '查询成功',
      data: result.data
    };

  } catch (error) {
    console.error('查询失败:', error);
    return {
      code: -1,
      message: '查询失败: ' + error.message
    };
  }
}
