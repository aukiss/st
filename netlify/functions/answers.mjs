import { db } from "./_lib/storage.mjs";

export async function handler(event) {
  if (event.httpMethod === "GET") {
    try {
      const ans = await db.getAnswer();
      return { statusCode: 200, body: JSON.stringify({ answer: ans }) };
    } catch (e) {
      return { statusCode: 200, body: JSON.stringify({ answer: "", error: String(e) }) };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { body: ansText } = body;
      await db.setAnswer(ansText || "");
      return { statusCode: 200, body: JSON.stringify({ message: "答案库已更新", answer: ansText || "" }) };
    } catch (e) {
      return { statusCode: 200, body: JSON.stringify({ message: "保存失败（安全模式）", error: String(e) }) };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
}
