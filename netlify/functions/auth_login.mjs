import { readFileSync } from "fs";
import path from "path";
export async function handler(event){
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Method Not Allowed" };
  const { phone, password } = JSON.parse(event.body||"{}");
  if(!phone || !password) return { statusCode:400, body: JSON.stringify({ message:"手机号和密码必填"})};
  const p = path.resolve("netlify/functions/_lib/users_fixed.json");
  const users = JSON.parse(readFileSync(p,"utf-8"));
  const u = users.find(x=>x.phone===String(phone) && x.password===String(password));
  if(!u) return { statusCode:401, body: JSON.stringify({ message:"账号或密码错误" }) };
  return { statusCode:200, body: JSON.stringify({ phone:u.phone, name:u.name, role:u.role, level:u.level||"中等" }) };
}
