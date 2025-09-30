import { db } from "./_lib/storage.mjs";
export async function handler(event){
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Method Not Allowed" };
  const { id, phone } = JSON.parse(event.body||"{}");
  if(!phone||!id) return { statusCode:400, body: JSON.stringify({ message:"缺少 phone 或 id" }) };
  const arr = await db.getMistakes(phone);
  const m = arr.find(x=>String(x.id)===String(id));
  if(!m) return { statusCode:404, body: JSON.stringify({ message:"未找到错题" }) };
  if(!m.resolved){ m.resolved=true; m.resolved_at=Date.now(); await db.setMistakes(phone, arr); }
  const acts = await db.getActivities(); acts.push({ id: Date.now(), user_id: phone, kind:'correction', meta:{ mistake_id:id }, created_at: Date.now() }); await db.setActivities(acts);
  return { statusCode:200, body: JSON.stringify({ ok:true }) };
}
