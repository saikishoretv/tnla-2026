import { fetchConstituencyDetail } from "@/lib/eci";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/constituency/[id]">
) {
  const { id } = await ctx.params;
  const acNo = parseInt(id);
  if (isNaN(acNo) || acNo < 1 || acNo > 234) {
    return Response.json({ error: "Invalid constituency ID" }, { status: 400 });
  }
  const data = await fetchConstituencyDetail(acNo);
  return Response.json(data);
}
