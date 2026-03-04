# 文件上传接口文档

## 概述

文件上传功能基于阿里云OSS实现，支持图片上传并返回可访问的URL。

## 基础信息

- **服务**: event-service
- **Base Path**: `/admin/files`
- **存储位置**: 阿里云OSS (oss-cn-beijing.aliyuncs.com)
- **Bucket**: taopiao

## 接口

### 上传图片

**请求**
```
POST /admin/files/upload
Content-Type: multipart/form-data
```

**参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file   | File | 是   | 图片文件 |

**文件限制**
- 支持格式: jpg, jpeg, png, gif, webp
- 最大大小: 5MB

**响应示例**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "https://taopiao.oss-cn-beijing.aliyuncs.com/images/abc123def456.jpg",
    "filename": "poster.jpg"
  }
}
```

## 错误码

| 错误码 | 说明               |
|--------|--------------------|
| 400    | 文件不能为空       |
| 400    | 文件大小超过5MB    |
| 400    | 不支持的图片格式   |
| 500    | 文件上传失败       |

## 前端调用示例

### FormData上传
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8083/admin/files/upload', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      console.log('图片URL:', data.data.url);
    }
  });
```

### Axios示例
```javascript
import axios from 'axios';

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/admin/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data.url;
};
```

## 文件命名规则

上传的文件会按以下规则命名：
- 目录: `images/`
- 文件名: `{UUID}.{扩展名}`

完整路径示例: `images/a1b2c3d4e5f6.jpg`

## 环境变量配置

服务端需要配置以下环境变量：

```bash
# 阿里云AccessKey ID
export ALICLOUD_ACCESS_KEY_ID=your_access_key_id

# 阿里云AccessKey Secret
export ALICLOUD_ACCESS_KEY_SECRET=your_access_key_secret
```

或通过系统环境变量设置相同名称的变量。
