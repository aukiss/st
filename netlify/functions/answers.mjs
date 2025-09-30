import { db } from "./_lib/storage.mjs";
export async function handler(event){
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Method Not Allowed" };
  const { phone, body } = JSON.parse(event.body||"{}");
  if(!phone) return { statusCode:401, body: JSON.stringify({ message:"需要教师身份（请使用老师账号登录页面）" }) };
  await db.setAnswer(body||"");
  return { statusCode:200, body: JSON.stringify({ message:"已保存答案库" }) };
}
