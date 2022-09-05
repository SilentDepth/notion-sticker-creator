<div align="center">
<img src="./packages/web/public/icon.png" width="128">
<h3>Notion 贴纸生成器</h3>
</div>

---

# 这是干啥的？

这是一个用来生成 Notion 中文社区 Telegram 贴纸包《[Notion 麻将牌](https://t.me/addstickers/notionzhong)》风格的自定义贴纸的在线工具。

# 这要怎么用？

本工具提供两种使用方式：Web、API。

## Web

在页面上方的输入框中输入贴纸文字，确认预览效果符合需要后，选择一个图像格式点击相应按钮下载图像文件即可。发送 WebP 文件会被 Telegram 视为贴纸消息，各方面的体验更佳，因此推荐使用此格式。

## API

_本项目针对 Vercel 部署设计实现。对于其他部署方式，以下内容仅供参考。_

发送一个 `GET /api/sticker/{贴纸文字}.{图像格式}` 请求即可获得对应的贴纸图像。

例：`GET /api/sticker/你好世界.webp`
