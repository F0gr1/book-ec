import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/lib/nexr-auth/options";
import prisma from "@/app/lib/prisma";

export async function GET() {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    try {
        const purchases = await prisma.purchase.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                bookId: true,
                createdAt: true,
            },
        });

        return NextResponse.json(purchases);
    } catch {
        return NextResponse.json({ error: "Unable to load purchases" }, { status: 500 });
    }
}
