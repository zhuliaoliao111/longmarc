# 云上长征 - 微信小程序（含云开发）

## 使用步骤

1. 安装并打开微信开发者工具。
2. 选择“导入项目”，项目目录选择本仓库根目录，`appid` 可先用 `touristappid`，后续在 `project.config.json` 中替换为你的真实 AppID。
3. 在工具栏开启“云开发”，创建或选择一个环境，复制环境 ID。
4. 在 `miniprogram/app.js` 中将 `env: 'replace-with-your-env-id'` 替换为上一步的环境 ID。
5. 在云开发控制台的“云函数”面板，点击“上传并部署：云端安装依赖”，选择 `getCheckpoints`。
6. 在模拟器中运行，底部 Tab 可切换“首页/地图/时间线”。

## 目录结构

- miniprogram/ 小程序代码
  - pages/index 首页
  - pages/map 地图
  - pages/timeline 时间线
- cloudfunctions/ 云函数
  - getCheckpoints 返回示例点位与时间线

## 常见问题

- 运行报错 `请使用 2.2.3 或以上的基础库`：在开发者工具“详情-本地设置”将基础库调整为较新版本。
- 地图不显示定位：需在模拟器设置或真机授权定位；本示例无需地图 key。
- 无法调用云函数：确认已在 `app.js` 正确填写环境 ID，且已部署云函数。 