import usersData from "./_lib/users_fixed.json" assert { type: "json" };
export async function handler(){
  const users = (usersData && (usersData.default || usersData)) || [];
  return { statusCode:200, body: JSON.stringify(users.map(u=>({ name:u.name, phone:u.phone, role:u.role, level:u.level||"中等" }))) };
}
