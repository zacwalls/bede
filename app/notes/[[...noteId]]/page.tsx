import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { redirect } from 'next/navigation';

import prisma from "@/app/lib/db";
import serverSession from '@/app/lib/session';

const EditorComp = dynamic(() => import('../../components/NoteEditor'), { ssr: false });

async function createNewNote(userId: string, userName: string) {
    const note = await prisma.note.create({
        data: {
            title: "Untitled",
            content: "",
            userId: userId,
            authorName: userName
        }
    });

    if (!note) {
        throw new Error("Failed to create note");
    }

    return note;
}

export default async function NoteEditor({ params }: { params: { noteId: string } }) {
    const session = await serverSession();

    if (!session) {
        return (
            <div>
                <h1>Not logged in</h1>
            </div>
        )
    }

    if (params.noteId === "new") {
        await createNewNote(session?.user?.id as string, session?.user?.name as string);
        redirect(`/notes/${note.id}`);
    }

    const note = await prisma.note.findUnique({
        where: {
            id: parseInt(params.noteId),
            userId: session?.user?.id
        }
    });

    if (!note) {
        throw new Error("Note not found");
    }

    return (
        <Suspense fallback={null}>
            <EditorComp note={note}></EditorComp>
        </Suspense>
    )
}