// app/api/links/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  let res = "";
  for (let i = 0; i < length; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const url = body?.url as string | undefined;
  let code = body?.code as string | undefined;

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (code) {
    if (!CODE_REGEX.test(code)) {
      return NextResponse.json(
        { error: "Code must match [A-Za-z0-9]{6,8}" },
        { status: 400 }
      );
    }

    const existing = await prisma.link.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }
  } else {
    // auto-generate unique code
    let unique = false;
    while (!unique) {
      const candidate = generateCode();
      const existing = await prisma.link.findUnique({ where: { code: candidate } });
      if (!existing) {
        code = candidate;
        unique = true;
      }
    }
  }

  const link = await prisma.link.create({
    data: { code: code!, url },
  });

  return NextResponse.json(link, { status: 201 });
}