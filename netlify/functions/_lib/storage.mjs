import { getBlob, setBlob } from "@netlify/blobs";
async function readJson(key, fallback){ const { body } = await getBlob({ name: key }); if(!body) return fallback; try{ return JSON.parse(await body.text()); }catch{ return fallback; } }
async function writeJson(key, obj){ await setBlob({ name: key, data: JSON.stringify(obj) }); }
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
