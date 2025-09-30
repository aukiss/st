import { db } from "./_lib/storage.mjs";
export async function handler(event){
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Method Not Allowed" };
  const { phone, name, level } = JSON.parse(event.body||"{}");
  if(!phone) return { statusCode:400, body: JSON.stringify({ message:"缺少 phone" }) };
  const prof = await db.getProfiles(); prof[phone] = { ...(prof[phone]||{}), name, level }; await db.setProfiles(prof);
  return { statusCode:200, body: JSON.stringify({ ok:true }) };
}
