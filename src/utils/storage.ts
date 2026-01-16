/**
 * LocalStorage 封装工具
 */

/**
 * 存储键名常量
 */
export const StorageKeys = {
  TOKEN: 'comfy_pilot_token',
  REFRESH_TOKEN: 'comfy_pilot_refresh_token',
  USER_INFO: 'comfy_pilot_user_info',
  REMEMBER_ME: 'comfy_pilot_remember_me',
  THEME: 'comfy_pilot_theme',
  LANGUAGE: 'comfy_pilot_language'
} as const

/**
 * 获取存储项
 */
export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Failed to get storage item: ${key}`, error)
    return null
  }
}

/**
 * 设置存储项
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to set storage item: ${key}`, error)
  }
}

/**
 * 移除存储项
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove storage item: ${key}`, error)
  }
}

/**
 * 清空所有存储
 */
export function clearStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Failed to clear storage', error)
  }
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return getStorageItem<string>(StorageKeys.TOKEN)
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  setStorageItem(StorageKeys.TOKEN, token)
}

/**
 * 获取 Refresh Token
 */
export function getRefreshToken(): string | null {
  return getStorageItem<string>(StorageKeys.REFRESH_TOKEN)
}

/**
 * 设置 Refresh Token
 */
export function setRefreshToken(refreshToken: string): void {
  setStorageItem(StorageKeys.REFRESH_TOKEN, refreshToken)
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  removeStorageItem(StorageKeys.TOKEN)
  removeStorageItem(StorageKeys.REFRESH_TOKEN)
}

/**
 * 移除 Refresh Token
 */
export function removeRefreshToken(): void {
  removeStorageItem(StorageKeys.REFRESH_TOKEN)
}

/**
 * 获取用户信息
 */
export function getUserInfo(): import('@/types/auth').UserInfo | null {
  return getStorageItem<import('@/types/auth').UserInfo>(StorageKeys.USER_INFO)
}

/**
 * 设置用户信息
 */
export function setUserInfo(userInfo: import('@/types/auth').UserInfo): void {
  setStorageItem(StorageKeys.USER_INFO, userInfo)
}

/**
 * 移除用户信息
 */
export function removeUserInfo(): void {
  removeStorageItem(StorageKeys.USER_INFO)
}
