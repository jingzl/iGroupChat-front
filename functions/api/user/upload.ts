export const onRequestPost: PagesFunction<Env> = async (context) =>{
    const { env, data } = context;
    
    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('requireSignedURLs', 'false');
    formData.append('metadata', JSON.stringify({
      user: data.user.userId
    }));

    // 调用 Cloudflare Images API 获取直接上传 URL
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v2/direct_upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.CF_API_TOKEN}`,
      },
      body: formData
    });
  
    const data1 = await response.json();
    console.log('上传头像', data1);
    //下发image前缀
    return Response.json({data :data1.result});
  }