import { sendSMS } from '../utils/sms';

interface Env {
  ALIYUN_ACCESS_KEY_ID: string;
  ALIYUN_ACCESS_KEY_SECRET: string;
  ALIYUN_SMS_SIGN_NAME: string;
  ALIYUN_SMS_TEMPLATE_CODE: string;
  bgkv: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const { phone } = await request.json();
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: '请输入正确的手机号'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 开发环境使用固定验证码
    const verificationCode = env.CF_PAGES !== '1' 
      ? '123456' 
      : Math.random().toString().slice(-6);
    if (env.CF_PAGES === '1') {
      try {
        await sendSMS(phone, verificationCode, {
          accessKeyId: env.ALIYUN_ACCESS_KEY_ID,
          accessKeySecret: env.ALIYUN_ACCESS_KEY_SECRET,
          signName: env.ALIYUN_SMS_SIGN_NAME,
          templateCode: env.ALIYUN_SMS_TEMPLATE_CODE
        });
      } catch (error) {
        console.error('SMS Error:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            message: error instanceof Error ? error.message : '发送验证码失败，请重试'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 存储验证码到 KV，设置 5 分钟过期
    await env.bgkv.put(`sms:${phone}`, verificationCode, {
      expirationTtl: 5 * 60 // 5分钟
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: '验证码发送成功'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Request Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: '请求格式错误'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
