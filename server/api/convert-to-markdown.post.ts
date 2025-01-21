// import { downCraft } from 'down-craft';

// export default defineEventHandler(async (event) => {
//   try {
//     const body = await readBody(event);
//     const { fileBuffer, fileType, options } = body;

//     if (!fileBuffer || !fileType) {
//       throw new Error('File buffer and file type are required.');
//     }

//     // 数値配列をBufferに変換
//     const buffer = Buffer.from(fileBuffer);

//     // Markdown変換処理
//     const markdown = await downCraft(buffer, fileType, options);

//     return { markdown };
//   } catch (error) {
//     return {
//       error: error.message,
//     };
//   }
// });
