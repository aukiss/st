import { readFileSync } from "fs"; import path from "path";
export async function handler(){
  const p = path.resolve("netlify/functions/_lib/users_fixed.json");
  const users = JSON.parse(readFileSync(p,"utf-8"));
  return { statusCode:200, body: JSON.stringify(users.map(u=>({ name:u.name, phone:u.phone, role:u.role, level:u.level||"中等" }))) };
}
