// 应用配置

/**
 * 应用基本信息配置
 */
export const appConfig = {
  // 系统名称
  name: '我的脚手架',
  // 系统版本
  version: '1.1.0',
  // 系统描述
  description: '一个功能完整的基础应用脚手架',
  // 版权信息
  copyright: '© 2026 基础应用. All rights reserved.'
}

/**
 * 获取系统名称
 */
export const getAppName = (): string => {
  return appConfig.name
}

/**
 * 获取系统版本
 */
export const getAppVersion = (): string => {
  return appConfig.version
}

/**
 * 获取系统描述
 */
export const getAppDescription = (): string => {
  return appConfig.description
}

/**
 * 获取版权信息
 */
export const getAppCopyright = (): string => {
  return appConfig.copyright
}