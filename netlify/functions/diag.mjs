export async function handler(){
  const must = ["OPENAI_BASE_URL","OPENAI_API_KEY"];
  const ok = must.filter(k=>!!process.env[k]);
  const miss = must.filter(k=>!process.env[k]);
  return { statusCode:200, body: JSON.stringify({
    ok: miss.length===0,
    present: ok,
    missing: miss,
    node: process.version,
    note: "仅检查变量是否存在，不会泄露值。"
  }) };
}