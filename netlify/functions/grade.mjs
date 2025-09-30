import { db } from "./_lib/storage.mjs"; import { callLLM } from "./_lib/llm.mjs";
export async function handler(event){
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Method Not Allowed" };
  const { submission, phone } = JSON.parse(event.body||"{}");
  if(!submission || !phone) return { statusCode:400, body: JSON.stringify({ message:"缺少 submission 或 phone" }) };
  const answers = await db.getAnswer();
  const schema1 = { type:"object", properties:{ items:{ type:"array", items:{ type:"object", properties:{ q_text:{type:"string"}, user_answer:{type:"string"}, reasoning_summary:{type:"string"}, provisional_result:{type:"string","enum":["对","错","部分正确"]}, provisional_correct_answer:{type:"string"} }, required:["q_text","user_answer","provisional_result","provisional_correct_answer","reasoning_summary"]}}}, required:["items"] };
  const msgs1 = [ { role:"system", content:"你是六年级（苏教版六上）数学批改老师。第一步只依据学生作答与通用数学规则判题，不参考任何答案库。严格输出JSON，符合schema1。" }, { role:"user", content:`学生作业（文本；可能含OCR误差）：\n${submission}\n请逐题整理为：题干、学生答案、模型推断的正确答案、判断（对/错/部分正确）和一句话理由。` } ];
  const pass1 = await callLLM(msgs1, schema1);
  const p1items = pass1.items||[];
  const schema2 = { type:"object", properties:{ items:{ type:"array", items:{ type:"object", properties:{ q_text:{type:"string"}, user_answer:{type:"string"}, result:{type:"string","enum":["对","错","部分正确"]}, feedback:{type:"string"}, correct_answer:{type:"string"}, source:{type:"string","enum":["model_only","bank_agreed","bank_overrode_model"]}, confidence:{type:"number", minimum:0, maximum:1} }, required:["q_text","user_answer","result","feedback","correct_answer","source","confidence"]}}}, required:["items"] };
  const msgs2 = [ { role:"system", content:"你现在作为复核老师：拿到“模型判题结果”和“标准答案库”进行核对。如果答案库能明确对应到同一题，则以答案库为准；若OCR或编号不一致，请基于题意模糊匹配。若答案库缺失或不可靠，保留模型结论。给出最终 result、feedback、correct_answer，并标注 source：bank_agreed / bank_overrode_model / model_only；confidence 0~1。" }, { role:"user", content:`模型初判：\n${JSON.stringify(p1items)}\n---\n标准答案库（纯文本，多题）：\n${answers||"（无）"}\n请复核并输出最终JSON（schema2）。` } ];
  const pass2 = await callLLM(msgs2, schema2);
  const finalItems = pass2.items||[];
  const list = await db.getMistakes(phone);
  for(const it of finalItems){ if(it.result!=="对"){ list.push({ id: Date.now()+Math.random(), created_at: Date.now(), q_text: it.q_text||"", user_answer: it.user_answer||"", correct_answer: it.correct_answer||"", result: it.result||"", feedback: it.feedback||"", resolved:false }); } }
  await db.setMistakes(phone, list);
  return { statusCode:200, body: JSON.stringify({ message:"已批改（模型优先 + 答案库复核）", data: finalItems }) };
}
