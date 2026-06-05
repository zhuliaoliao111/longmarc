const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { action, imageName, imagePath } = event;

  try {
    console.log('云函数调用:', action, imageName);

    switch (action) {
      case 'uploadSingle':
        return await uploadSingleImage(imageName, imagePath);
      case 'getImageUrl':
        return await getImageUrl(imageName);
      case 'getAllImageUrls':
        return await getAllImageUrls();
      case 'test':
        return {
          code: 0,
          message: '云函数测试成功',
          data: { timestamp: Date.now() }
        };
      default:
        return {
          code: -1,
          message: '无效的操作类型',
          data: null
        };
    }
  } catch (error) {
    console.error('云函数执行失败:', error);
    return {
      code: -1,
      message: `操作失败: ${error.message}`,
      data: null
    };
  }
};

// 上传单张图片
async function uploadSingleImage(imageName, imagePath) {
  try {
    console.log(`准备上传图片: ${imageName}`);

    if (!imageName || !imagePath) {
      return {
        code: -1,
        message: '缺少必要的参数',
        data: null
      };
    }

    // 上传到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: `images/${imageName}`,
      filePath: imagePath
    });

    const fileID = uploadResult.fileID;
    console.log(`上传成功，文件ID: ${fileID}`);

    // 保存到数据库
    const imageData = {
      fileName: imageName,
      fileID: fileID,
      uploadTime: db.serverDate(),
      status: 'active'
    };

    // 检查是否已存在
    const existing = await db.collection('images')
      .where({ fileName: imageName })
      .get();

    if (existing.data && existing.data.length > 0) {
      // 更新现有记录
      await db.collection('images')
        .doc(existing.data[0]._id)
        .update({
          data: imageData
        });
      console.log('更新数据库记录成功');
    } else {
      // 添加新记录
      await db.collection('images').add({
        data: imageData
      });
      console.log('添加数据库记录成功');
    }

    return {
      code: 0,
      message: '图片上传成功',
      data: {
        fileName: imageName,
        fileID: fileID
      }
    };

  } catch (error) {
    console.error('上传单张图片失败:', error);
    return {
      code: -1,
      message: `上传失败: ${error.message}`,
      data: null
    };
  }
}

// 获取单张图片URL
async function getImageUrl(imageName) {
  try {
    console.log(`获取图片URL: ${imageName}`);

    const result = await db.collection('images')
      .where({
        fileName: imageName,
        status: 'active'
      })
      .get();

    if (result.data && result.data.length > 0) {
      const imageData = result.data[0];

      // 获取临时访问URL
      const tempUrlResult = await cloud.getTempFileURL({
        fileList: [imageData.fileID]
      });

      if (tempUrlResult.fileList && tempUrlResult.fileList.length > 0) {
        return {
          code: 0,
          message: '获取图片URL成功',
          data: {
            fileName: imageName,
            url: tempUrlResult.fileList[0].tempFileURL,
            fileID: imageData.fileID
          }
        };
      }
    }

    return {
      code: -1,
      message: '图片不存在或已失效',
      data: null
    };

  } catch (error) {
    console.error('获取图片URL失败:', error);
    return {
      code: -1,
      message: `获取失败: ${error.message}`,
      data: null
    };
  }
}

// 获取所有图片URL
async function getAllImageUrls() {
  try {
    console.log('获取所有图片URL');

    const result = await db.collection('images')
      .where({
        status: 'active'
      })
      .get();

    if (result.data && result.data.length > 0) {
      // 获取所有文件的临时URL
      const fileIDs = result.data.map(item => item.fileID);
      const tempUrlResult = await cloud.getTempFileURL({
        fileList: fileIDs
      });

      // 构建返回数据
      const imageUrls = {};
      result.data.forEach((item, index) => {
        imageUrls[item.fileName] = {
          fileID: item.fileID,
          url: tempUrlResult.fileList[index]?.tempFileURL || null,
          uploadTime: item.uploadTime
        };
      });

      return {
        code: 0,
        message: '获取所有图片URL成功',
        data: imageUrls
      };
    }

    return {
      code: 0,
      message: '暂无图片数据',
      data: {}
    };

  } catch (error) {
    console.error('获取所有图片URL失败:', error);
    return {
      code: -1,
      message: `获取失败: ${error.message}`,
      data: null
    };
  }
}
