import { db } from "./_lib/storage.mjs";
export async function handler(event){
  if(event.httpMethod==="POST"){
    let payload={};
    try{ payload = JSON.parse(event.body||"{}"); }catch{ payload={}; }
    const kind = payload.kind; const phone = payload.phone;
    if(!phone) return j(400,{ message:"缺少 phone" });
    if(!kind || !["checkin","correction"].includes(kind)) return j(400,{ message:"kind 必须是 checkin 或 correction" });
    try{
      const arr = await db.getActivities();
      arr.push({ id: Date.now(), user_id: phone, kind, created_at: Date.now() });
      await db.setActivities(arr);
      return j(200,{ ok:true });
    }catch(e){
      return j(200,{ ok:false, message:"（安全模式）记录失败，但不影响继续学习。", error:String(e) });
    }
  }
  const days = Math.max(1, Math.min(30, parseInt((event.queryStringParameters||{}).days||"7")));
  const since = Date.now() - days*24*3600*1000;
  const arr = (await db.getActivities()).filter(a=>a.created_at>since);
  const byUser = {};
  for(const a of arr){
    byUser[a.user_id] = byUser[a.user_id] || { phone: a.user_id, days:{} };
    const d = new Date(a.created_at).toISOString().slice(0,10);
    const rec = byUser[a.user_id].days[d] = byUser[a.user_id].days[d] || { checkins:0, corrections:0 };
    if(a.kind==='checkin') rec.checkins++;
    if(a.kind==='correction') rec.corrections++;
  }
  const board = Object.values(byUser).map(u=>{
    const daysArr = Object.values(u.days);
    const half = Math.max(1, Math.floor(daysArr.length/2));
    const earlyAvg = avg(daysArr.slice(0,half).map(x=>x.corrections));
    const lateAvg  = avg(daysArr.slice(half).map(x=>x.corrections));
    const totals = daysArr.reduce((s,x)=>(s.checkins+=x.checkins,s.corrections+=x.corrections,s),{checkins:0,corrections:0});
    return { phone:u.phone, name:"", total_checkins: totals.checkins, total_corrections: totals.corrections, progress_delta: (lateAvg-earlyAvg) };
  }).sort((a,b)=> b.total_checkins-a.total_checkins || b.total_corrections-a.total_corrections);
  return j(200, { days, board });
}
function avg(arr){ return arr.length? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
function j(code,obj){ return { statusCode:code, body: JSON.stringify(obj) }; }