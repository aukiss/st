import { db } from "./_lib/storage.mjs"; import { callLLM } from "./_lib/llm.mjs";
export async function handler(event){
  const q = event.queryStringParameters||{}; const phone = q.phone; const id = q.id;
  if(!phone||!id) return { statusCode:400, body: JSON.stringify({ message:"缺少 phone 或 id" }) };
  const arr = await db.getMistakes(phone);
  const m = arr.find(x=>String(x.id)===String(id));
  if(!m) return { statusCode:404, body: JSON.stringify({ message:"未找到错题" }) };
  const schema = { type:"object", properties:{ card:{ type:"string" }}, required:["card"] };
  const msgs = [
    { role:"system", content:"你是耐心的六年级数学老师。用简短分点给出：错因分析→关键知识点→一步步提示→举一反三1-2题。语气友好，不输出思维过程。" },
    { role:"user", content:`错题：${m.q_text}\n学生答案：${m.user_answer}\n标准答案：${m.correct_answer||""}\n老师点评：${m.feedback||""}\n请生成讲解卡。` }
  ];
  const out = await callLLM(msgs, schema);
  m.tutor_card = out.card||""; await db.setMistakes(phone, arr);
  return { statusCode:200, body: JSON.stringify(out) };
}
