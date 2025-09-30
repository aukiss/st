import { db } from "./_lib/storage.mjs";
export async function handler(event){
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Method Not Allowed" };
  try{
    const body = typeof event.body==="string" ? event.body : "";
    const payload = body ? JSON.parse(body) : {};
    const { phone, name, level } = payload;
    if(!phone) return { statusCode:400, body: JSON.stringify({ message:"缺少 phone" }) };
    const prof = await db.getProfiles();
    prof[phone] = { ...(prof[phone]||{}), name, level };
    await db.setProfiles(prof);
    return { statusCode:200, body: JSON.stringify({ ok:true }) };
  }catch(e){
    return { statusCode:200, body: JSON.stringify({ ok:false, message:"运行于安全模式：保存失败但不影响继续使用。", error:String(e) }) };
  }
}