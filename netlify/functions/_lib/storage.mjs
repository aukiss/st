// 动态引入 Netlify Blobs；失败则使用内存兜底（冷启动会丢，但绝不 502）
let mem = {
  "db/answer.json": "",
  "db/activities.json": [],
  "db/profiles.json": {},
  "db/broadcasts.json": []
};
const memMistakes = {};

async function loadBlobs(){
  try{
    const mod = await import("@netlify/blobs");
    return mod;
  }catch(e){
    // 没装好、打包缺失或运行时不可用，返回 null 走内存
    return null;
  }
}

async function readJson(key, fallback){
  const blobs = await loadBlobs();
  if(!blobs){
    if(key.startsWith("db/mistakes_")){
      return memMistakes[key] ?? fallback;
    }
    return (key in mem) ? mem[key] : fallback;
  }
  try{
    const { getBlob } = blobs;
    const { body } = await getBlob({ name: key });
    if(!body) return fallback;
    return JSON.parse(await body.text());
  }catch{
    return fallback;
  }
}

async function writeJson(key, obj){
  const blobs = await loadBlobs();
  if(!blobs){
    if(key.startsWith("db/mistakes_")){
      memMistakes[key] = obj;
      return;
    }
    mem[key] = obj;
    return;
  }
  const { setBlob } = blobs;
  await setBlob({ name: key, data: JSON.stringify(obj) });
}

export const db = {
  getAnswer: ()=>readJson("db/answer.json",""),
  setAnswer: (t)=>writeJson("db/answer.json",t||""),
  getActivities: ()=>readJson("db/activities.json",[]),
  setActivities: (a)=>writeJson("db/activities.json",a||[]),
  getMistakes: (phone)=>readJson(`db/mistakes_${phone}.json`,[]),
  setMistakes: (phone,arr)=>writeJson(`db/mistakes_${phone}.json`,arr||[]),
  getProfiles: ()=>readJson("db/profiles.json",{}),
  setProfiles: (obj)=>writeJson("db/profiles.json",obj||{}),
  getBroadcasts: ()=>readJson("db/broadcasts.json",[]),
  setBroadcasts: (arr)=>writeJson("db/broadcasts.json",arr||[])
};
