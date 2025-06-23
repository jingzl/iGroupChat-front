interface Env {
    bgdb: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { env, data } = context;
        
        // 从数据库获取用户信息
        const db = env.bgdb;
        const userInfo = await db.prepare(`
            SELECT id, phone, nickname, avatar_url, status
            FROM users 
            WHERE id = ?
        `).bind(data.user.userId).first();

        if (!userInfo) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: '用户不存在' 
                }), 
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }
        //处理avatar_url
        if (userInfo.avatar_url) {
            userInfo.avatar_url = `${env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${userInfo.avatar_url}/public`;
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                data: userInfo 
            }), 
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                message: '服务器错误' 
            }), 
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}; 