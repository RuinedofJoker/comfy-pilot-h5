/**
 * 工作流内容深度比较工具
 */

type ShouldIgnoreFn = (path: string[]) => boolean

/**
 * 深度比较两个工作流内容是否相等
 * @param content1 第一个内容
 * @param content2 第二个内容
 * @param shouldIgnore 判断路径是否应该被忽略的函数
 */
export function compareWorkflowContent(
  content1: string,
  content2: string,
  shouldIgnore?: ShouldIgnoreFn
): boolean {
  if (content1 === content2) return true
  if (!content1 || !content2) return content1 === content2

  try {
    const obj1 = JSON.parse(content1)
    const obj2 = JSON.parse(content2)
    return deepEqual(obj1, obj2, [], shouldIgnore)
  } catch {
    return content1 === content2
  }
}

/**
 * 递归深度比较两个对象
 */
function deepEqual(
  obj1: any,
  obj2: any,
  path: string[] = [],
  shouldIgnore?: ShouldIgnoreFn
): boolean {
  if (obj1 === obj2) return true

  if (typeof obj1 !== typeof obj2) {
    // console.log(`[差异] 路径: ${path.join('.')} | 类型不同: ${typeof obj1} vs ${typeof obj2}`)
    return false
  }

  if (obj1 == null || obj2 == null) {
    if (obj1 !== obj2) {
      // console.log(`[差异] 路径: ${path.join('.')} | null/undefined 不同: ${obj1} vs ${obj2}`)
    }
    return obj1 === obj2
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      // console.log(`[差异] 路径: ${path.join('.')} | 数组长度不同: ${obj1.length} vs ${obj2.length}`)
      return false
    }
    return obj1.every((item, index) =>
      deepEqual(item, obj2[index], [...path, String(index)], shouldIgnore)
    )
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    const filteredKeys1 = shouldIgnore
      ? keys1.filter(key => !shouldIgnore([...path, key]))
      : keys1
    const filteredKeys2 = shouldIgnore
      ? keys2.filter(key => !shouldIgnore([...path, key]))
      : keys2

    if (filteredKeys1.length !== filteredKeys2.length) {
      // console.log(`[差异] 路径: ${path.join('.')} | 对象 key 数量不同: ${filteredKeys1.length} vs ${filteredKeys2.length}`)
      return false
    }

    const allKeys = new Set([...filteredKeys1, ...filteredKeys2])
    if (allKeys.size !== filteredKeys1.length) {
      // const diff1 = filteredKeys1.filter(k => !filteredKeys2.includes(k))
      // const diff2 = filteredKeys2.filter(k => !filteredKeys1.includes(k))
      // console.log(`[差异] 路径: ${path.join('.')} | 对象 key 不一致 | 仅在obj1: [${diff1}] | 仅在obj2: [${diff2}]`)
      return false
    }

    return filteredKeys1.every(key => {
      const isEqual = deepEqual(obj1[key], obj2[key], [...path, key], shouldIgnore)
      if (!isEqual && typeof obj1[key] !== 'object') {
        // console.log(`[差异] 路径: ${path.join('.')}.${key} | 值不同: ${JSON.stringify(obj1[key])} vs ${JSON.stringify(obj2[key])}`)
      }
      return isEqual
    })
  }

  if (obj1 !== obj2) {
    // console.log(`[差异] 路径: ${path.join('.')} | 基本类型值不同: ${obj1} vs ${obj2}`)
  }
  return obj1 === obj2
}
