import { NextRequest, NextResponse } from "next/server";
import { menuItems, restaurants } from "../../../lib/data";
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  return NextResponse.json({
    restaurants: restaurants.filter(item => item.name.toLowerCase().includes(query)),
    menuItems: menuItems.filter(item => item.name.toLowerCase().includes(query)),
  });
}
