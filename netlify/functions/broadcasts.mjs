import { db } from "./_lib/storage.mjs";
export async function handler(event){
  if(event.httpMethod==="GET"){ const arr = await db.getBroadcasts(); return { statusCode:200, body: JSON.stringify(arr) }; }
  const { title, body, audience, student_phone } = JSON.parse(event.body||"{}");
  const arr = await db.getBroadcasts();
  arr.unshift({ id: Date.now(), created_at: Date.now(), title:title||"", body:body||"", audience:audience||"all", student_phone: (student_phone||"").replace(/\D+/g,'')||null });
  await db.setBroadcasts(arr.slice(0,200));
  return { statusCode:200, body: JSON.stringify({ message:"已发布" }) };
}
