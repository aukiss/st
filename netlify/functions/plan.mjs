import { db } from "./_lib/storage.mjs"; import { callLLM } from "./_lib/llm.mjs";
export async function handler(event){
  const q = event.queryStringParameters||{}; const phone = q.phone; const level = q.level || "中等";
  if(!phone) return { statusCode:400, body: JSON.stringify({ message:"缺少 phone" }) };
  const arr = await db.getMistakes(phone);
  const topics = arr.slice(-20).map(x=>x.q_text).join(" | ") || "分数乘法、约分、单位换算";
  const schema = { type:"object", properties:{ plan:{ type:"string" }}, required:["plan"] };
  const msgs = [
    { role:"system", content:"你是小学数学学习规划师。按“简单/中等/拔高”难度生成7天复习计划：每日目标+2-3道示例题。语言简洁、可执行。" },
    { role:"user", content:`学生最近错题主题：${topics}\n难度：${level}\n教材：苏教版六年级上册。请生成7天计划。` }
  ];
  const out = await callLLM(msgs, schema);
  return { statusCode:200, body: JSON.stringify(out) };
}
