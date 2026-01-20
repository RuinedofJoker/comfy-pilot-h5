# ComfyUI 集成方案文档

## 1. 概述

本文档详细说明了 Comfy Pilot H5 平台如何与 ComfyUI 进行集成，包括当前实现方式、遇到的问题以及解决方案。

## 2. 当前集成方式

### 2.1 页面结构

工作流编辑器页面 ([WorkflowEditorView.vue](../src/views/workflow/WorkflowEditorView.vue)) 通过 iframe 嵌入 ComfyUI 界面：

```vue
<!-- ComfyUI 视图 -->
<div v-show="currentView === 'comfyui'" class="f-comfyui-view">
  <div v-if="!currentWorkflow" class="f-empty-state">
    <svg class="f-icon f-icon-xl" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
    </svg>
    <div>请选择一个工作流开始编辑</div>
  </div>
  <iframe
    v-else
    ref="comfyuiFrame"
    class="f-comfyui-iframe"
    :src="comfyuiUrl"
  ></iframe>
</div>
```

### 2.2 ComfyUI URL 计算

```typescript
// 计算ComfyUI URL
const comfyuiUrl = computed(() => {
  if (!currentService.value || !currentWorkflow.value) return ''
  return currentService.value.baseUrl
})
```

### 2.3 工作流内容获取

当用户切换到 JSON 视图时，尝试从 iframe 获取工作流内容：

```typescript
// 切换视图
function switchView(view: 'comfyui' | 'json'): void {
  currentView.value = view
  if (view === 'json') {
    fetchWorkflowFromIframe()
  }
}

// 从 iframe 获取工作流内容
function fetchWorkflowFromIframe(): void {
  if (!comfyuiFrame.value?.contentWindow) {
    toast.warning('无法获取工作流内容')
    return
  }

  try {
    // 尝试通过 postMessage 获取工作流
    comfyuiFrame.value.contentWindow.postMessage({ type: 'GET_WORKFLOW' }, '*')

    // 监听响应
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'WORKFLOW_DATA' && event.data?.workflow) {
        workflowJsonContent.value = JSON.stringify(event.data.workflow, null, 2)
        window.removeEventListener('message', handleMessage)
      }
    }

    window.addEventListener('message', handleMessage)

    // 5秒超时
    setTimeout(() => {
      window.removeEventListener('message', handleMessage)
    }, 5000)
  } catch (error) {
    console.error('获取工作流内容失败:', error)
    toast.error('获取工作流内容失败')
  }
}
```

## 3. 当前问题

### 3.1 跨域通信限制

由于 iframe 和父页面可能存在跨域限制，直接访问 iframe 内部的 DOM 或 JavaScript 对象会被浏览器阻止。

### 3.2 ComfyUI 原生不支持 postMessage

ComfyUI 原生代码中没有实现 postMessage 监听器，因此父页面发送的消息无法被 ComfyUI 接收和响应。

## 4. 解决方案

### 方案 1: 修改 ComfyUI 源码（推荐）

**优点**:
- ✅ 最直接、最可靠的方案
- ✅ 完全控制通信逻辑
- ✅ 易于维护和更新
- ✅ 符合 ComfyUI 的扩展机制

**缺点**:
- ❌ 需要修改 ComfyUI 源码
- ❌ ComfyUI 更新时需要重新应用修改

**实现步骤**:

#### 步骤 1: 在 ComfyUI 主入口文件中添加消息监听器

在 `web/scripts/app.js` 或主入口文件中添加以下代码：

```javascript
// 监听来自父窗口的消息
window.addEventListener('message', (event) => {
  // 可选：验证消息来源
  // const allowedOrigins = ['http://localhost:5173', 'https://your-domain.com'];
  // if (!allowedOrigins.includes(event.origin)) {
  //   console.warn('拒绝来自未授权源的消息:', event.origin);
  //   return;
  // }

  if (event.data?.type === 'GET_WORKFLOW') {
    try {
      // 获取当前工作流数据
      // ComfyUI 的工作流数据通常存储在 app.graph 中
      const workflow = app.graph.serialize();

      // 发送工作流数据回父窗口
      event.source.postMessage({
        type: 'WORKFLOW_DATA',
        workflow: workflow
      }, '*');

      console.log('工作流数据已发送');
    } catch (error) {
      console.error('获取工作流失败:', error);
      event.source.postMessage({
        type: 'WORKFLOW_ERROR',
        error: error.message
      }, '*');
    }
  }
});
```

#### 步骤 2: 测试通信

在浏览器控制台测试：

```javascript
// 在 H5 应用控制台执行
const iframe = document.querySelector('.f-comfyui-iframe');
iframe.contentWindow.postMessage({ type: 'GET_WORKFLOW' }, '*');

// 监听响应
window.addEventListener('message', (e) => {
  if (e.data?.type === 'WORKFLOW_DATA') {
    console.log('收到工作流数据:', e.data.workflow);
  }
});
```

---

### 方案 2: 通过浏览器扩展注入

**优点**:
- ✅ 不需要修改 ComfyUI 源码
- ✅ 可以随时启用/禁用
- ✅ 适合开发和测试

**缺点**:
- ❌ 需要用户安装浏览器扩展
- ❌ 不适合生产环境
- ❌ 维护成本高

**实现步骤**:

创建 Tampermonkey 用户脚本：

```javascript
// ==UserScript==
// @name         ComfyUI PostMessage Bridge
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Enable postMessage communication for ComfyUI
// @match        http://localhost:8188/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 等待 ComfyUI app 对象加载
    const waitForApp = setInterval(() => {
        if (window.app && window.app.graph) {
            clearInterval(waitForApp);
            setupMessageListener();
        }
    }, 100);

    function setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'GET_WORKFLOW') {
                try {
                    const workflow = window.app.graph.serialize();
                    event.source.postMessage({
                        type: 'WORKFLOW_DATA',
                        workflow: workflow
                    }, '*');
                } catch (error) {
                    console.error('获取工作流失败:', error);
                }
            }
        });
        console.log('ComfyUI PostMessage Bridge 已启用');
    }
})();
```

---

### 方案 3: 通过 ComfyUI 自定义节点

**优点**:
- ✅ 不需要修改 ComfyUI 核心代码
- ✅ 易于分发和安装
- ✅ 符合 ComfyUI 的扩展机制
- ✅ 可以随 ComfyUI 一起更新

**缺点**:
- ❌ 需要用户手动安装自定义节点
- ❌ 实现相对复杂

**实现步骤**:

#### 步骤 1: 创建自定义节点目录结构

```
custom_nodes/
└── comfy_pilot_bridge/
    ├── __init__.py
    ├── web/
    │   └── postmessage_bridge.js
    └── README.md
```

#### 步骤 2: 实现 Python 节点注册

`__init__.py`:

```python
"""
ComfyUI PostMessage Bridge
Enables communication between ComfyUI and parent window via postMessage API
"""

WEB_DIRECTORY = "./web"

__all__ = ['WEB_DIRECTORY']
```

#### 步骤 3: 实现 JavaScript 扩展

`web/postmessage_bridge.js`:

```javascript
import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "ComfyPilot.PostMessageBridge",
    async setup() {
        console.log("ComfyPilot PostMessage Bridge 正在初始化...");

        window.addEventListener('message', (event) => {
            // 可选：验证消息来源
            // const allowedOrigins = ['http://localhost:5173'];
            // if (!allowedOrigins.includes(event.origin)) return;

            if (event.data?.type === 'GET_WORKFLOW') {
                try {
                    const workflow = app.graph.serialize();
                    event.source.postMessage({
                        type: 'WORKFLOW_DATA',
                        workflow: workflow
                    }, '*');
                    console.log('工作流数据已发送');
                } catch (error) {
                    console.error('获取工作流失败:', error);
                    event.source.postMessage({
                        type: 'WORKFLOW_ERROR',
                        error: error.message
                    }, '*');
                }
            }
        });

        console.log('ComfyPilot PostMessage Bridge 已启用');
    }
});
```

#### 步骤 4: 添加 README

`README.md`:

```markdown
# ComfyUI PostMessage Bridge

This custom node enables communication between ComfyUI and parent window via postMessage API.

## Installation

1. Clone this repository into your ComfyUI custom_nodes directory:
   ```bash
   cd ComfyUI/custom_nodes
   git clone https://github.com/your-repo/comfy_pilot_bridge.git
   ```

2. Restart ComfyUI

## Usage

This extension automatically enables postMessage communication. No additional configuration needed.
```

---

### 方案 4: 通过后端 API 代理

**优点**:
- ✅ 不需要修改 ComfyUI 前端代码
- ✅ 更安全（可以在后端进行权限控制）
- ✅ 适合生产环境

**缺点**:
- ❌ 需要后端支持
- ❌ 实时性较差
- ❌ 增加服务器负载

**实现方式**:

通过后端 API 调用 ComfyUI 的 API 接口获取工作流数据，而不是直接从 iframe 获取。

```typescript
// 修改 fetchWorkflowFromIframe 函数
async function fetchWorkflowFromIframe(): Promise<void> {
  if (!currentWorkflow.value) {
    toast.warning('未选择工作流')
    return
  }

  try {
    // 通过后端 API 获取工作流内容
    const content = await getWorkflowContent(currentWorkflow.value.id)
    workflowJsonContent.value = content
  } catch (error) {
    console.error('获取工作流内容失败:', error)
    toast.error('获取工作流内容失败')
  }
}
```

---

## 5. 推荐方案

### 🏆 推荐使用方案 3: ComfyUI 自定义节点

**理由**:

1. **不侵入核心代码**: 不需要修改 ComfyUI 的核心代码，避免了版本更新时的冲突
2. **易于分发**: 可以作为独立的自定义节点分发，用户只需要安装即可
3. **符合 ComfyUI 生态**: 使用 ComfyUI 官方推荐的扩展机制
4. **易于维护**: 代码独立，易于维护和更新
5. **生产环境友好**: 可以在生产环境中稳定运行

### 备选方案

如果无法使用自定义节点，可以考虑：

- **开发环境**: 使用方案 2（浏览器扩展）进行快速开发和测试
- **生产环境**: 使用方案 4（后端 API 代理）确保安全性和稳定性

---

## 6. 安全建议

### 6.1 消息来源验证

在生产环境中，建议添加消息来源验证：

```javascript
window.addEventListener('message', (event) => {
  // 验证消息来源
  const allowedOrigins = [
    'http://localhost:5173',
    'https://your-production-domain.com'
  ];

  if (!allowedOrigins.includes(event.origin)) {
    console.warn('拒绝来自未授权源的消息:', event.origin);
    return;
  }

  // 处理消息...
});
```

### 6.2 消息类型验证

确保只处理预期的消息类型：

```javascript
const ALLOWED_MESSAGE_TYPES = ['GET_WORKFLOW', 'SET_WORKFLOW', 'EXECUTE_WORKFLOW'];

if (!ALLOWED_MESSAGE_TYPES.includes(event.data?.type)) {
  console.warn('未知的消息类型:', event.data?.type);
  return;
}
```

### 6.3 错误处理

添加完善的错误处理机制：

```javascript
try {
  const workflow = app.graph.serialize();
  event.source.postMessage({
    type: 'WORKFLOW_DATA',
    workflow: workflow
  }, '*');
} catch (error) {
  console.error('获取工作流失败:', error);
  event.source.postMessage({
    type: 'WORKFLOW_ERROR',
    error: error.message
  }, '*');
}
```

---

## 7. 未来扩展

### 7.1 双向通信

除了获取工作流数据，还可以实现：

- **加载工作流**: 从平台向 ComfyUI 发送工作流数据
- **执行工作流**: 触发 ComfyUI 执行工作流
- **监听状态变化**: 实时同步工作流编辑状态

### 7.2 消息类型扩展

```typescript
// 平台 -> ComfyUI
interface PlatformToComfyUIMessage {
  type: 'GET_WORKFLOW' | 'SET_WORKFLOW' | 'EXECUTE_WORKFLOW' | 'CLEAR_WORKFLOW'
  payload?: any
}

// ComfyUI -> 平台
interface ComfyUIToPlatformMessage {
  type: 'WORKFLOW_DATA' | 'WORKFLOW_ERROR' | 'EXECUTION_START' | 'EXECUTION_COMPLETE'
  payload?: any
}
```

### 7.3 状态同步

实现工作流编辑状态的实时同步：

```javascript
// ComfyUI 端监听工作流变化
app.graph.onAfterChange = () => {
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'WORKFLOW_CHANGED',
      workflow: app.graph.serialize()
    }, '*');
  }
};
```

---

## 8. 参考资料

- [ComfyUI GitHub Repository](https://github.com/comfyanonymous/ComfyUI)
- [MDN: Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [ComfyUI Custom Nodes Guide](https://github.com/comfyanonymous/ComfyUI/wiki/Custom-Nodes)

---

**文档版本**: 1.0
**最后更新**: 2026-01-20
**维护者**: Comfy Pilot 开发团队
