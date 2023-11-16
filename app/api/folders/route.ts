import { NextResponse } from "next/server";

import prisma from "@/app/lib/db";
import serverSession from "@/app/lib/session";

export async function POST(request: Request) {
    const session = await serverSession();
    const { userId } = await request.json();
    const folder = await prisma.noteFolder.create({
        data: {
            name: "Untitled Folder",
            userId: userId,
        }
    });

    if (!folder) {
        return new NextResponse("Unable to create new folder", { status: 400 });
    }

    if (!session || folder.userId !== session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    return new NextResponse(null, { status: 200 });
}

export async function PATCH(request: Request) {
    const session = await serverSession();
    const { userId, folderId, newName } = await request.json();
    const folder = await prisma.noteFolder.findUnique({
        where: {
            id: folderId,
            userId: userId
        }
    });

    if (!folder) {
        return new NextResponse("Unable to find folder", { status: 404 });
    }

    if (!session || folder.userId !== session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedFolder = prisma.noteFolder.update({
        where: {
            id: folderId,
            userId: userId
        },
        data: {
            name: newName
        }
    });

    if (!updatedFolder) {
        return new NextResponse("Unable to update note", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}