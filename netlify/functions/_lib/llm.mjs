export async function callLLM(messages){
  const base=process.env.OPENAI_BASE_URL;
  const key=process.env.OPENAI_API_KEY;
  if(!base || !key){
    return { "__safe_mode__": true, "reason": "缺少 OPENAI_BASE_URL 或 OPENAI_API_KEY" };
  }

  const controller = new AbortController();
  const t = setTimeout(()=>controller.abort(), 60000); // 60s 超时

  try{
    const r = await fetch(`${base}/chat/completions`, {
      method:"POST",
      headers:{ "Authorization":`Bearer ${key}`, "Content-Type":"application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        messages
      }),
      signal: controller.signal
    });
    clearTimeout(t);

    const txt = await r.text();
    if(!r.ok) return { "__safe_mode__": true, "reason": "上游模型接口响应异常", "status": r.status, "body": txt };

    // 从内容里提取 JSON
    try{
      const data=JSON.parse(txt);
      const raw = data.choices?.[0]?.message?.content||"{}";
      const jsonStr = extractJson(raw);
      return JSON.parse(jsonStr);
    }catch(e){
      const jsonStr = extractJson(txt);
      if(jsonStr) { try{ return JSON.parse(jsonStr);}catch{} }
      return { "__safe_mode__": true, "reason": "模型返回无法解析为JSON", "raw": txt };
    }
  }catch(e){
    clearTimeout(t);
    return { "__safe_mode__": true, "reason": "调用模型接口网络/超时错误", "error": String(e) };
  }
}

function extractJson(s){
  if(typeof s!=="string") return "";
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if(start>=0 && end>start){ return s.slice(start, end+1); }
  return "";
}
