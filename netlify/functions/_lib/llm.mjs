export async function callLLM(messages, schema){
  const base=process.env.OPENAI_BASE_URL;
  const key=process.env.OPENAI_API_KEY;
  // Safe mode: if missing env, don't throw 500; return stub explaining what's needed.
  if(!base || !key){
    return { "__safe_mode__": true, "reason": "缺少 OPENAI_BASE_URL 或 OPENAI_API_KEY（请在 Netlify Site settings → Environment variables 配置）" };
  }
  try{
    const r = await fetch(`${base}/chat/completions`, {
      method:"POST",
      headers:{ "Authorization":`Bearer ${key}`, "Content-Type":"application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: schema ? { type:"json_schema", json_schema:{ name:"out", schema, strict:true } } : undefined,
        messages
      })
    });
    const txt = await r.text();
    if(!r.ok) return { "__safe_mode__": true, "reason": "上游模型接口响应异常", "status": r.status, "body": txt };
    try{
      const data=JSON.parse(txt);
      const content=data.choices?.[0]?.message?.content||"{}";
      return JSON.parse(content);
    }catch(e){
      return { "__safe_mode__": true, "reason": "模型返回无法解析为JSON", "raw": txt };
    }
  }catch(e){
    return { "__safe_mode__": true, "reason": "调用模型接口网络错误", "error": String(e) };
  }
}