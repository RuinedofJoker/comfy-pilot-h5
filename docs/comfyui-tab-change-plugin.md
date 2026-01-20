# ComfyUI 标签页切换事件插件

## 概述

此插件用于监听 ComfyUI 内部标签页切换事件，并主动向父窗口（Comfy Pilot 平台）推送工作流内容更新，实现实时同步。

## 实现方式

### 方案 1：修改 ComfyUI 源码（推荐用于开发环境）

在 ComfyUI 的 `web/scripts/ui/tabs.js` 或主入口文件中添加：

```javascript
// 监听标签页切换事件
const originalSelectTab = app.ui.tabs.selectTab
app.ui.tabs.selectTab = function(tab) {
  // 调用原始方法
  const result = originalSelectTab.call(this, tab)

  // 向父窗口推送工作流内容
  if (window.parent !== window && app.graph) {
    try {
      const workflow = app.graph.serialize()
      window.parent.postMessage({
        type: 'comfy-pilot:tab-changed',
        payload: workflow
      }, '*')
    } catch (error) {
      console.error('推送工作流失败:', error)
    }
  }

  return result
}
```

### 方案 2：通过自定义节点扩展（推荐用于生产环境）

创建 ComfyUI 自定义节点：`custom_nodes/comfy_pilot_bridge/`

#### 文件结构

```
custom_nodes/comfy_pilot_bridge/
├── __init__.py
├── web/
│   └── tab_change_listener.js
└── README.md
```

#### `__init__.py`

```python
"""
ComfyUI Pilot Bridge - 标签页切换监听器
"""

WEB_DIRECTORY = "./web"

__all__ = ['WEB_DIRECTORY']
```

#### `web/tab_change_listener.js`

```javascript
import { app } from "../../scripts/app.js"

app.registerExtension({
  name: "ComfyPilot.TabChangeListener",

  async setup() {
    console.log("ComfyPilot 标签页监听器已启动")

    // 拦截标签页切换方法
    const originalSelectTab = app.ui.tabs.selectTab

    app.ui.tabs.selectTab = function(tab) {
      // 调用原始方法
      const result = originalSelectTab.call(this, tab)

      // 向父窗口推送工作流内容
      if (window.parent !== window && app.graph) {
        try {
          const workflow = app.graph.serialize()

          window.parent.postMessage({
            type: 'comfy-pilot:tab-changed',
            payload: workflow
          }, '*')

          console.log('工作流内容已推送到父窗口')
        } catch (error) {
          console.error('推送工作流失败:', error)
        }
      }

      return result
    }
  }
})
```

#### `README.md`

```markdown
# ComfyUI Pilot Bridge

ComfyUI 与 Comfy Pilot 平台的通信桥接插件。

## 功能

- 监听 ComfyUI 标签页切换事件
- 自动向父窗口推送工作流内容更新
- 消除平台端轮询延迟，实现实时同步

## 安装

1. 克隆到 ComfyUI 自定义节点目录：
   ```bash
   cd ComfyUI/custom_nodes
   git clone https://github.com/your-repo/comfy_pilot_bridge.git
   ```

2. 重启 ComfyUI

## 使用

插件会自动启用，无需额外配置。当在 Comfy Pilot 平台中使用 ComfyUI 时，标签页切换会自动同步到平台。
```

## 消息协议

### 平台 → ComfyUI

| 消息类型 | 说明 | Payload |
|---------|------|---------|
| `comfy-pilot:get-workflow` | 请求获取当前工作流 | `null` |
| `comfy-pilot:set-workflow` | 设置工作流内容 | `{ workflow: object }` |
| `comfy-pilot:new-workflow` | 创建新标签页 | `null` |

### ComfyUI → 平台

| 消息类型 | 说明 | Payload |
|---------|------|---------|
| `comfy-pilot:workflow-data` | 响应工作流请求 | `{ workflow: object }` |
| `comfy-pilot:tab-changed` | 标签页切换通知 | `{ workflow: object }` |

## 效果

- **之前**：标签页切换后，平台需要等待最多 3 秒才能检测到变化
- **之后**：标签页切换后，平台立即（< 100ms）收到更新通知

## 兼容性

- ComfyUI 版本：≥ 0.1.0
- 浏览器：支持 postMessage API 的现代浏览器

## 安全建议

生产环境中建议添加消息来源验证：

```javascript
// 验证消息来源
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-production-domain.com'
]

if (!allowedOrigins.includes(event.origin)) {
  console.warn('拒绝来自未授权源的消息:', event.origin)
  return
}
```
