import { env } from "cloudflare:workers";

export type Inquiry = { id:string; name:string; company:string|null; email:string; phone:string; city:string; format:string; start_date:string|null; duration:string; message:string|null; client_id:string|null; quote_amount:number|null; quote_details:string|null; status:string; created_at:number };
export type Billboard = { id:string; code:string; name:string; city:string; location:string; format:string; width_ft:number|null; height_ft:number|null; facing:string|null; monthly_rate:number|null; status:string; notes:string|null; created_at:number };
export type Client = { id:string; name:string; company:string|null; email:string; phone:string|null; city:string|null; status:string; notes:string|null; created_at:number };
export type Contract = { id:string; client_id:string; billboard_id:string|null; inquiry_id:string|null; campaign_name:string; start_date:string; end_date:string; amount:number|null; terms:string|null; submitted:number; status:string; created_at:number };

async function query<T>(sql: string): Promise<{ rows: T[]; unavailable: boolean }> {
  try {
    if (!env.DB) throw new Error("D1 unavailable");
    const res = await env.DB.prepare(sql).all<T>();
    return { rows: res.results || [], unavailable: false };
  } catch (error) {
    console.error("Admin D1 query failed", error);
    return { rows: [], unavailable: true };
  }
}

export function getInquiries() {
  return query<Inquiry>("SELECT id,name,company,email,phone,city,format,start_date,duration,message,client_id,quote_amount,quote_details,COALESCE(status,'new') AS status,created_at FROM inquiries ORDER BY created_at DESC LIMIT 200");
}
export function getBillboards() {
  return query<Billboard>("SELECT id,code,name,city,location,format,width_ft,height_ft,facing,monthly_rate,COALESCE(status,'available') AS status,notes,created_at FROM billboards ORDER BY city, code");
}
export function getClients() {
  return query<Client>("SELECT id,name,company,email,phone,city,COALESCE(status,'prospect') AS status,notes,created_at FROM clients ORDER BY created_at DESC");
}
export function getContracts() {
  return query<Contract>("SELECT id,client_id,billboard_id,inquiry_id,campaign_name,start_date,end_date,amount,terms,COALESCE(submitted,0) AS submitted,COALESCE(status,'pending') AS status,created_at FROM contracts ORDER BY created_at DESC");
}

export const money = (n: number | null | undefined) =>
  n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US");
export const shortDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
