interface Env {
    bgdb: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { env } = context;
        const db = env.bgdb;
        
        // 测试数据库连接
        const result = await db.prepare(
            "SELECT * FROM users"
        ).all();
        
        return new Response(JSON.stringify({
            success: true,
            tables: result,
            env: Object.keys(env)
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 