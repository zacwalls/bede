import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Session } from 'next-auth';

import prisma from "@/app/lib/db";
import Editor from '@/app/components/Editor'
import serverSession from '@/app/lib/session';

async function createNewNote(userId: string) {
    const note = await prisma.note.create({
        data: {
            title: "Untitled",
            content: "",
            userId: userId
        }
    });

    if (!note) {
        throw new Error("Failed to create note");
    }

    return note;
}

async function NoteEditor({ noteId, session }: { noteId: string, session: Session }) {
    let note;

    if (noteId === "new") {
        note = await createNewNote(session?.user?.id);
        redirect(`/notes/${note.id}`);
    } else {
        note = await prisma.note.findUnique({
            where: {
                id: parseInt(noteId),
                userId: session?.user?.id
            }
        });

        if (!note) {
            throw new Error("Note not found");
        }
    }

    return (
        <Editor note={note}></Editor>
    )
}

export default async function Note({ params }: { params: { noteId: string[] } }) {
    const session = await serverSession();

    if (!session) {
        return (
            <div>
                <h1>Not logged in</h1>
            </div>
        )
    }

    if (params.noteId && params.noteId[0]) {
        return <NoteEditor noteId={params.noteId[0]} session={session} />;
    }

    const notes = await prisma.note.findMany({
        where: {
            userId: session?.user?.id
        }
    }) || [];

    return (
        <>
            <div className="flex flex-col items-center justify-center w-full flex-1">
                <h1>My Notes</h1>
                <Link href="/notes/new">New Note</Link>
                {notes?.map((note: any) => {
                    return (
                        <div key={note.id} className="flex flex-col items-center justify-center w-full">
                            <h2><Link href={`/notes/${note.id}`}>{note.title}</Link></h2>
                        </div>
                    )
                })}
            </div>
        </>
    )
}