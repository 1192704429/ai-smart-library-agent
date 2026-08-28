/**
 * 设备管理工具
 */

/**
 * 获取设备唯一标识
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    // 生成设备指纹
    const fingerprint = generateFingerprint();
    deviceId = btoa(fingerprint); // Base64编码
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

/**
 * 生成设备指纹
 */
function generateFingerprint(): string {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${ua}_${screen}_${timestamp}_${random}`;
}

/**
 * 获取设备类型
 */
export function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "TABLET";
  }
  
  if (/mobile|iphone|ipod|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return "MOBILE";
  }
  
  return "WEB";
}

/**
 * 清除设备ID（用于测试）
 */
export function clearDeviceId(): void {
  localStorage.removeItem("deviceId");
}
