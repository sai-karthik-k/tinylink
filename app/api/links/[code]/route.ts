import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;

  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(link);
}

export async function DELETE(_req: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;

  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.link.delete({ where: { code } });

  return new Response(null, { status: 204 });
}