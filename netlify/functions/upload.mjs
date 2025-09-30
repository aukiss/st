import { createBlobWriter } from "@netlify/blobs";
export async function handler(event){
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Method Not Allowed" };
  const { name, data, contentType, phone } = JSON.parse(event.body||"{}");
  if(!name || !data || !phone) return { statusCode:400, body: JSON.stringify({ message:"缺少文件或 phone" }) };
  const key = `submissions/${phone}/${Date.now()}_${name}`;
  const writer = await createBlobWriter({ name: key, contentType: contentType||"application/octet-stream" });
  await writer.write(Buffer.from(data, "base64")); await writer.close();
  return { statusCode:200, body: JSON.stringify({ key }) };
}
