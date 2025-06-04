/**
 * 日期时间格式化工具函数
 */

/**
 * 格式化时间戳或日期字符串
 * @param time 时间戳或日期字符串
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTime(time: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!time) return ''
  
  const date = new Date(time)
  
  if (isNaN(date.getTime())) {
    return ''
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期（不包含时间）
 * @param time 时间戳或日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(time: string | number | Date): string {
  return formatTime(time, 'YYYY-MM-DD')
}

/**
 * 格式化相对时间（多久前）
 * @param time 时间戳或日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(time: string | number | Date): string {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
} 