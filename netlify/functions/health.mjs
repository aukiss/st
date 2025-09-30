export async function handler(){
  return { statusCode:200, body: JSON.stringify({ ok:true, ts: Date.now(), note:"/health 正常，说明 Functions 能跑。若其他 502，多半是环境变量或上游模型接口问题。" }) };
}