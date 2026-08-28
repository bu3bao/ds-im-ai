# ds-im-ai · 网站智能助手（客服 + 助手）

为 ds.aikeyu.cn（DeepSeek Exporter）配套开发的嵌入式 AI 智能助手，
基于 **Agnes AI 免费 API**（OpenAI 兼容格式），带本地知识库，零第三方依赖。

## 组成

| 文件 | 作用 |
|---|---|
| `server.js` | Node 后端代理：隐藏 API Key、注入知识库、SSE 流式转发、限流 |
| `knowledge/base.md` | 知识库（Markdown），已根据您站点的真实公告/规则预填 |
| `public/widget.js` | 一行代码嵌入的聊天浮窗组件 |
| `public/demo.html` | 模拟站点风格的演示页 |

## 本地运行

```powershell
# 1. 到 https://platform.agnes-ai.com/ 注册并创建 API Key
# 2. 设置环境变量并启动（PowerShell）
$env:AGNES_API_KEY = 'sk-你的key'
node server.js

# 3. 浏览器打开 http://localhost:8787 即可看到演示页和右下角聊天窗
```

> Windows PowerShell 若中文日志乱码，先执行：
> `$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8`

## 上线部署

1. 把整个 `ds-im-ai` 文件夹上传到您的一台服务器（有 Node 18+ 即可，无需 npm install）
2. 配置环境变量后启动，建议用 pm2 / Windows 服务守护：
   ```powershell
   $env:AGNES_API_KEY = 'sk-...'
   node server.js          # 生产建议: pm2 start server.js --name im-ai
   ```
3. 反向代理一个域名（如 `ai.aikeyu.cn`）指向该服务的 8787 端口，并加 HTTPS
4. 在 ds.aikeyu.cn 每个页面 `</body>` 前加一行：
   ```html
   <script src="https://ai.aikeyu.cn/widget.js" data-server="https://ai.aikeyu.cn"></script>
   ```

## 知识库维护

直接编辑 `knowledge/base.md`（或往 `knowledge/` 里加更多 `.md` 文件），
**保存即生效，无需重启**。当前已预填：功能说明、每日 3 次免费额度、
激活码规则、小程序关停、网络优化通告、常见问题应答口径等。

## 切换 / 备用模型

所有配置均走环境变量，主模型故障时自动切换一次备用：

```powershell
$env:AGNES_BASE_URL = 'https://apihub.agnes-ai.com/v1'   # 默认值
$env:AGNES_MODEL    = 'agnes-2.0-flash'                   # 默认值
# 可选备用（例：DeepSeek 官方 API）
$env:FALLBACK_BASE_URL = 'https://api.deepseek.com/v1'
$env:FALLBACK_API_KEY  = 'sk-...'
$env:FALLBACK_MODEL    = 'deepseek-chat'
```

因为是标准 OpenAI 兼容格式，将来换任何一家模型商都只需改这三个环境变量。

## 生产前建议收紧的两点

- `server.js` 中 CORS 目前是 `*`，上线后改成只允许 `https://ds.aikeyu.cn`
- 限流阈值为每 IP 每分钟 15 条（`RATE_LIMIT`），可按免费额度情况调整
