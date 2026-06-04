import { NextRequest, NextResponse } from "next/server";
import { menuItems } from "../../../lib/data";
export async function GET(req: NextRequest) {
  const restaurant = req.nextUrl.searchParams.get("restaurant");
  return NextResponse.json(restaurant ? menuItems.filter(item => item.restaurantId === restaurant) : menuItems);
}
