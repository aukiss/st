import { db } from "./_lib/storage.mjs";
export async function handler(event){
  const q = event.queryStringParameters||{}; const phone = q.phone;
  if(!phone) return { statusCode:400, body: JSON.stringify({ message:"缺少 phone" }) };
  const arr = await db.getMistakes(phone);
  return { statusCode:200, body: JSON.stringify(arr.slice(-100).reverse().map(x=>({ id:x.id, q_text:x.q_text, user_answer:x.user_answer, result:x.result }))) };
}
