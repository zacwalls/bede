import { NextResponse } from 'next/server';

import prisma from '@/app/lib/db';
import { getServerSession } from '@/app/layout';

export async function PATCH(request: Request, context: { params: { noteId: string } }) {
    const session = await getServerSession();
    
    const { newContent } = await request.json();
    const note = await prisma.note.findUnique({
        where: {
            id: Number(context.params.noteId),
        },
    });

    if (!newContent === undefined) {
        return new NextResponse("No new content supplied", { status: 400 });
    }

    if (!note) {
        return new NextResponse("Note not found", { status: 404 });
    }

    if (!session || note.userId !== session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedNote = await prisma.note.update({
        where: {
            id: Number(context.params.noteId),
        },
        data: {
            content: newContent,
        },
    });

    if (!updatedNote) {
        return new NextResponse("Unable to update note", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}