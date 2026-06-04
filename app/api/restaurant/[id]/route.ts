import { NextResponse } from "next/server";
import { menuItems, restaurants } from "../../../../lib/data";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = restaurants.find(item => item.id === id);
  if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
  return NextResponse.json({ ...restaurant, menuItems: menuItems.filter(item => item.restaurantId === id) });
}

