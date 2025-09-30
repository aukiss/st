export async function callLLM(messages, schema){
  const base=process.env.OPENAI_BASE_URL; const key=process.env.OPENAI_API_KEY;
  if(!base||!key) throw new Error("缺少 OPENAI_BASE_URL / OPENAI_API_KEY");
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
  if(!r.ok) throw new Error(txt);
  try{ const data=JSON.parse(txt); const content=data.choices?.[0]?.message?.content||"{}"; return JSON.parse(content); }
  catch{ return { raw: txt }; }
}
