import { db } from "./_lib/storage.mjs";
import { callLLM } from "./_lib/llm.mjs";

export async function handler(event){
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Method Not Allowed" };

  let payload={};
  try{ payload = JSON.parse(event.body||"{}"); }catch{ payload={}; }
  const { submission, phone } = payload;
  if(!submission || !phone) return j(400,{ message:"缺少 submission 或 phone" });

  try{
    const answers = await db.getAnswer();

    // Pass1：只看学生作答（模型优先）
    const msgs1 = [
      { role:"system", content:"你是六年级（苏教版六上）数学批改老师。第一步只依据学生作答与通用数学规则判题，不参考任何答案库。输出 JSON：{items:[{q_text, user_answer, provisional_result(对/错/部分正确), provisional_correct_answer, reasoning_summary}]}。" },
      { role:"user", content:`学生作业（文本，可能有 OCR 误差）：\n${submission}\n请逐题整理。` }
    ];
    const pass1 = await callLLM(msgs1);
    if(pass1.__safe_mode__){
      return j(200,{ message:"（安全模式）未连接模型，请检查上游接口/网络。", safe_info: pass1 });
    }
    const p1items = pass1.items||[];

    // Pass2：用答案库复核
    const msgs2 = [
      { role:"system", content:"你是复核老师：拿到“模型判题结果”和“标准答案库”进行核对。如果答案库能明确对应到同一题，则以答案库为准；若 OCR 或编号不一致，请基于题意模糊匹配。若答案库缺失或不可靠，保留模型结论。输出 JSON：{items:[{q_text,user_answer,result(对/错/部分正确),feedback,correct_answer,source(bank_agreed/bank_overrode_model/model_only),confidence}]}" },
      { role:"user", content:`模型初判：\n${JSON.stringify(p1items)}\n---\n标准答案库（纯文本，多题）：\n${answers||"（无）"}` }
    ];
    const pass2 = await callLLM(msgs2);
    if(pass2.__safe_mode__){
      return j(200,{ message:"（安全模式）复核未调用模型，先保留初判。", safe_info: pass2, data: p1items });
    }
    const finalItems = pass2.items||[];

    // 只把非“对”的题记入错题本
    const list = await db.getMistakes(phone);
    for(const it of finalItems){
      if(it.result!=="对"){
        list.push({
          id: Date.now()+Math.random(),
          created_at: Date.now(),
          q_text: it.q_text||"",
          user_answer: it.user_answer||"",
          correct_answer: it.correct_answer||"",
          result: it.result||"",
          feedback: it.feedback||"",
          resolved:false
        });
      }
    }
    await db.setMistakes(phone, list);

    // 统计“改错”行为（便于排行榜展示努力程度）
    const corrCount = finalItems.filter(x=>x.result!=="对").length;
    if(corrCount>0){
      const acts = await db.getActivities();
      acts.push({ id: Date.now(), user_id: phone, kind:'correction', meta:{ count:corrCount }, created_at: Date.now() });
      await db.setActivities(acts);
    }

    return j(200,{ message:"已批改（模型优先 + 答案库复核）", data: finalItems });
  }catch(e){
    // 任何异常都转成 200，避免 502
    return j(200,{ message:"（安全模式）批改失败，请稍后再试", error:String(e) });
  }
}

function j(code,obj){ return { statusCode:code, body: JSON.stringify(obj) }; }
