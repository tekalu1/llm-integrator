import bcrypt from 'bcryptjs'
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync, mkdirSync } from 'fs'

export default defineEventHandler(async (event) => {
    const dir = './server/db/'
    const file = dir + 'auth.json'

    // ディレクトリが無ければ作成
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }

    const adapter = new JSONFile(file);
    const db = new Low(adapter,adapter);

    const body = await readBody(event)
    const { username, password, email } = body
    
    if (!username || !password) {
    return { error: 'Invalid input' }
    }

    // データベースを読み込み
    await db.read();

    console.log("db.data : " + JSON.stringify(db.data))

    // デフォルトデータを適切に設定
    if (!db.data.users) {
        db.data = { users: [] }; // データが存在しない場合に初期化
        await db.write(); // 初期化をファイルに保存
    }
    
    // ユーザー名が既に存在しないかチェック
    const userExists = db.data.users.find(u => u.username === username)
        if (userExists) {
        return { error: 'Username already exists' }
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
    id: db.data.users.length + 1,
    username,
    password: hashedPassword,
    email
    }

    db.data.users.push(newUser)
    await db.write()

    return { success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email } }
})
