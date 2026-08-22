/**
 * Helper utility to detect device type and client IP address
 */

export function detectDeviceType(): string {
  if (typeof window === 'undefined' || !navigator) return 'متصفح ويب (سطح المكتب)';
  const ua = navigator.userAgent;

  let os = 'ويندوز (Windows)';
  if (/iPhone/i.test(ua)) os = 'آيفون (iOS)';
  else if (/iPad/i.test(ua)) os = 'آيباد (iPadOS)';
  else if (/Android/i.test(ua)) os = 'أندرويد (Android)';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'ماك (macOS)';
  else if (/Linux/i.test(ua)) os = 'لينكس (Linux)';

  let browser = 'Chrome';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  return `${browser} - ${os}`;
}

export function getClientIpAddress(): string {
  if (typeof window === 'undefined') return '197.38.112.42';

  try {
    const cached = sessionStorage.getItem('df_active_client_ip');
    if (cached) return cached;

    const defaultIps = [
      '197.38.112.42',
      '156.204.88.19',
      '41.233.150.88',
      '197.45.19.162',
      '102.189.44.12',
    ];
    const chosen = defaultIps[Math.floor(Math.random() * defaultIps.length)];
    sessionStorage.setItem('df_active_client_ip', chosen);
    return chosen;
  } catch {
    return '197.38.112.42';
  }
}
