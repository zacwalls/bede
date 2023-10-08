import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { redirect } from 'next/navigation';

import prisma from "@/app/lib/db";
import serverSession from '@/app/lib/session';

const NoteEditor = dynamic(() => import('../../components/NoteEditor'), { ssr: false });

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

export default async function Editor({ params }: { params: { noteId: string } }) {
    const session = await serverSession();
    let note;

    if (!session) {
        return (
            <div>
                <h1>Not logged in</h1>
            </div>
        )
    }

    if (params.noteId[0] === "new") {
        note = await createNewNote(session?.user?.id as string, session?.user?.name as string);
        redirect(`/note/${note.id}`);
    } else {
        note = await prisma.note.findUnique({
            where: {
                id: parseInt(params.noteId),
                userId: session?.user?.id
            }
        });
    }

    if (!note) {
        throw new Error("Note not found");
    }

    return (
        <Suspense fallback={null}>
            <NoteEditor note={note}></NoteEditor>
        </Suspense>
    )
}