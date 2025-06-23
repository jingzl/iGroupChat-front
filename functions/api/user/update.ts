interface Env {
    bgdb: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { env, data, request } = context;
        
        // 解析请求体
        const body = await request.json();
        const { nickname, avatar_url } = body;

        // 构建 SQL 更新语句和参数
        let sql = 'UPDATE users SET updated_at = DATETIME(\'now\')';
        const params = [];

        // 如果有昵称更新
        if (nickname !== undefined) {
            if (typeof nickname !== 'string' || nickname.length > 32) {
                return new Response(
                    JSON.stringify({ 
                        success: false, 
                        message: '昵称格式不正确' 
                    }), 
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            sql += ', nickname = ?';
            params.push(nickname);
        }

        // 如果有头像更新
        if (avatar_url !== undefined) {
            if (typeof avatar_url !== 'string') {
                return new Response(
                    JSON.stringify({ 
                        success: false, 
                        message: '头像URL格式不正确' 
                    }), 
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
            sql += ', avatar_url = ?';
            params.push(avatar_url);
        }

        // 添加 WHERE 条件
        sql += ' WHERE id = ?';
        params.push(data.user.userId);

        // 执行更新
        const result = await env.bgdb.prepare(sql).bind(...params).run();

        if (!result.success) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: '更新失败' 
                }), 
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // 获取更新后的用户信息
        const userInfo = await env.bgdb.prepare(`
            SELECT id, phone, nickname, avatar_url, status
            FROM users 
            WHERE id = ?
        `).bind(data.user.userId).first();
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