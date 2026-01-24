import { ref, computed } from 'vue'

/**
 * 工作流历史记录管理
 * 用于实现撤销/重做功能
 */
export function useWorkflowHistory() {
  // 历史栈：存储工作流内容的历史记录
  const historyStack = ref<string[]>([])

  // 当前指针位置：指向当前显示的内容在栈中的位置
  // -1 表示当前内容与已保存内容相同（栈为空或在初始状态）
  const currentPointer = ref<number>(-1)

  // 是否正在应用历史记录（用于防止递归触发）
  const isApplyingHistory = ref(false)

  /**
   * 是否可以撤销
   * 当指针 > 0 时可以撤销（栈中至少有2个元素，可以回到前一个）
   */
  const canUndo = computed(() => currentPointer.value > 0)

  /**
   * 是否可以重做
   * 当指针 < 栈长度-1 时可以重做
   */
  const canRedo = computed(() => currentPointer.value < historyStack.value.length - 1)

  /**
   * 推入新的历史记录
   * @param content 工作流内容
   */
  function pushHistory(content: string): void {
    // 如果正在应用历史记录，不要推入新记录
    if (isApplyingHistory.value) {
      return
    }

    // 如果当前指针不在栈顶，清空指针后面的所有内容
    if (currentPointer.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, currentPointer.value + 1)
    }

    // 推入新内容
    historyStack.value.push(content)
    // 指针指向新推入的内容
    currentPointer.value = historyStack.value.length - 1

    // console.log('[WorkflowHistory] 推入历史记录，当前指针:', currentPointer.value, '栈大小:', historyStack.value.length)
  }

  /**
   * 撤销：指针向前移动
   * @returns 撤销后的内容，如果无法撤销则返回 null
   */
  function undo(): string | null {
    if (!canUndo.value) {
      return null
    }

    isApplyingHistory.value = true
    currentPointer.value--

    // console.log('[WorkflowHistory] 撤销，当前指针:', currentPointer.value, '栈大小:', historyStack.value.length)

    // 返回指针指向的内容
    const result = historyStack.value[currentPointer.value] || null

    // 延迟重置标志，确保不会立即触发新的历史记录（增加到 300ms）
    setTimeout(() => {
      isApplyingHistory.value = false
      // console.log('[WorkflowHistory] 撤销操作完成，重置 isApplyingHistory 标志')
    }, 300)

    return result
  }

  /**
   * 重做：指针向后移动
   * @returns 重做后的内容，如果无法重做则返回 null
   */
  function redo(): string | null {
    if (!canRedo.value) {
      return null
    }

    isApplyingHistory.value = true
    currentPointer.value++

    // console.log('[WorkflowHistory] 重做，当前指针:', currentPointer.value, '栈大小:', historyStack.value.length)

    const result = historyStack.value[currentPointer.value] || null

    // 延迟重置标志，确保不会立即触发新的历史记录（增加到 300ms）
    setTimeout(() => {
      isApplyingHistory.value = false
      // console.log('[WorkflowHistory] 重做操作完成，重置 isApplyingHistory 标志')
    }, 300)

    return result
  }

  /**
   * 重置历史记录
   * 用于切换工作流或保存后重置状态
   */
  function resetHistory(): void {
    historyStack.value = []
    currentPointer.value = -1
    isApplyingHistory.value = false
    // console.log('[WorkflowHistory] 历史记录已重置')
  }

  /**
   * 获取当前历史状态信息（用于调试）
   */
  function getHistoryInfo() {
    return {
      stackSize: historyStack.value.length,
      currentPointer: currentPointer.value,
      canUndo: canUndo.value,
      canRedo: canRedo.value,
      isApplyingHistory: isApplyingHistory.value
    }
  }

  return {
    // 状态
    canUndo,
    canRedo,
    isApplyingHistory,

    // 方法
    pushHistory,
    undo,
    redo,
    resetHistory,
    getHistoryInfo
  }
}
