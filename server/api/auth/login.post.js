import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export default defineEventHandler(async (event) => {
    const adapter = new JSONFile('./server/db/db.json');
    const db = new Low(adapter,adapter);
    await db.read();

    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
    return { error: 'Invalid credentials' }
    }

    const user = db.data.users.find(u => u.username === username)
    if (!user) {
    return { error: 'User not found' }
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
    return { error: 'Incorrect password' }
    }

    // JWT発行例（秘密鍵は環境変数などから）
    // const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    const token = jwt.sign({ id: user.id, username: user.username }, "60a56575f10741403c4a7f0c4ecd71d96dd421f740b3e9b25335493f8a78682a8d701edde79043adc5ad14e41c611fc33506ec77cf2c00d192e9461ce917e635", {
    expiresIn: '1d'
    })

    // Cookieにセット (HttpOnly推奨)
    setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24
    })

    return { success: true }
})
