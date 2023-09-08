import { NextResponse } from "next/server";

import prisma from "@/app/lib/db";
import serverSession from "@/app/lib/session";

export async function PATCH(
  request: Request,
  context: { params: { noteId: string } }
) {
  const session = await serverSession();

  const { newContent, newTitle } = await request.json();
  const note = await prisma.note.findUnique({
    where: {
      id: Number(context.params.noteId),
    },
  });

  if (newContent === undefined && newTitle === undefined) {
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
      title: newTitle,
    },
  });

  if (!updatedNote) {
    return new NextResponse("Unable to update note", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}

export async function GET(
  request: Request,
  context: { params: { noteId: string|undefined } }
) {
  const session = await serverSession();
  let note;

  if (context.params.noteId) {
    note = await prisma.note.findUnique({
      where: {
        id: Number(context.params.noteId),
      },
    });
  } else {
    note = await prisma.note.findMany({
      where: {
        userId: session?.user?.id,
      },
    });
  }

  if (!note) {
    return new NextResponse("Note(s) not found", { status: 404 });
  }

  return new NextResponse(JSON.stringify(note), { status: 200 });
}
