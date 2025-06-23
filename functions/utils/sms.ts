interface AliyunSMSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  templateCode: string;
}

// 辅助函数：生成随机字符串
function generateNonce(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 辅助函数：计算 HMAC-SHA256（V3 使用 SHA256）
async function calculateHmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    messageData
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function sendSMS(phone: string, code: string, config: AliyunSMSConfig) {
  const API_URL = 'https://dysmsapi.aliyuncs.com/';
  const API_VERSION = '2017-05-25';
  
  // 准备请求参数
  const params = {
    AccessKeyId: config.accessKeyId,
    Action: 'SendSms',
    Format: 'JSON',  // 明确指定返回 JSON 格式
    PhoneNumbers: phone,
    SignName: config.signName,
    TemplateCode: config.templateCode,
    TemplateParam: JSON.stringify({ code }),
    Version: API_VERSION,
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: generateNonce(16),
    Timestamp: new Date().toISOString()
  };

  // 参数排序
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => ({
      ...acc,
      [key]: params[key]
    }), {});

  // 构建签名字符串
  const canonicalizedQueryString = Object.entries(sortedParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join('&');

  const stringToSign = `GET&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`;

  // 计算签名
  const signature = await calculateHmacSha1(stringToSign, `${config.accessKeySecret}&`);

  // 构建最终的 URL
  const finalUrl = `${API_URL}?${canonicalizedQueryString}&Signature=${encodeURIComponent(signature)}`;

  // 发送请求
  const response = await fetch(finalUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  const responseText = await response.text();
  let responseData;

  try {
    responseData = JSON.parse(responseText);
  } catch (e) {
    console.error('Response:', responseText);
    throw new Error('Invalid response format from SMS service');
  }
  //console.log(responseData, finalUrl)
  if (!response.ok || responseData.Code !== 'OK') {
    throw new Error(responseData.Message || 'SMS send failed');
  }

  return responseData;
}

// 辅助函数：计算 HMAC-SHA1
async function calculateHmacSha1(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    messageData
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
} 