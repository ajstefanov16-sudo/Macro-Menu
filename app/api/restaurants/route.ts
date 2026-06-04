import { NextResponse } from "next/server";
import { restaurants } from "../../../lib/data";
export async function GET() { return NextResponse.json(restaurants); }
