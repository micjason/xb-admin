/**
 * 格式化工具函数集合
 */

/**
 * 格式化时间
 * @param time 时间字符串或时间戳
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTime(time: string | number | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!time) return '';
  
  const date = new Date(time);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化相对时间（多久前）
 * @param time 时间字符串或时间戳
 * @returns 相对时间字符串
 */
export function formatRelativeTime(time: string | number | Date): string {
  if (!time) return '';
  
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 0) return '刚刚';
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 12 * month;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`;
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`;
  } else {
    return `${Math.floor(diff / year)}年前`;
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 格式化数字（千分位分隔）
 * @param num 数字
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, decimals?: number): string {
  if (isNaN(num)) return '0';
  
  let result = num.toString();
  
  if (decimals !== undefined) {
    result = num.toFixed(decimals);
  }
  
  return result.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化百分比
 * @param value 数值
 * @param total 总数
 * @param decimals 小数位数，默认为2
 * @returns 百分比字符串
 */
export function formatPercentage(value: number, total: number, decimals: number = 2): string {
  if (total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号，默认为'¥'
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number, currency: string = '¥', decimals: number = 2): string {
  return `${currency}${formatNumber(amount, decimals)}`;
}

/**
 * 隐藏手机号中间四位
 * @param phone 手机号
 * @returns 隐藏后的手机号
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 隐藏邮箱用户名部分
 * @param email 邮箱
 * @returns 隐藏后的邮箱
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
}

/**
 * 隐藏身份证号
 * @param idCard 身份证号
 * @returns 隐藏后的身份证号
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 6) return idCard;
  return idCard.replace(/(\d{6})\d*(\d{4})/, '$1****$2');
} 