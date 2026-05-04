import { fetchAllConstituencies } from "@/lib/eci";

export async function GET() {
  const data = await fetchAllConstituencies();
  return Response.json(data);
}
