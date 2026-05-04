import { fetchSummary } from "@/lib/eci";

export async function GET() {
  const data = await fetchSummary();
  return Response.json(data);
}
