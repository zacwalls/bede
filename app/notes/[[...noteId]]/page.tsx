import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Session } from 'next-auth';

import prisma from "@/app/lib/db";
import Editor from '@/app/components/NoteEditor'
import serverSession from '@/app/lib/session';

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

async function NoteEditor({ noteId, session }: { noteId: string, session: Session }) {
    let note;

    if (noteId === "new") {
        note = await createNewNote(session?.user?.id as string, session?.user?.name as string);
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

export default async function Notes({ params }: { params: { noteId: string[] } }) {
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
            <div className="flex flex-col items-center justify-center w-full">
                <div className="flex justify-between w-full self-start flex-row-reverse p-4">
                    <div className="px-4 py-2 border border-black">
                        <Link href="/notes/new">New Note</Link>
                    </div>
                </div>
                <div className="flex flex-col w-full">
                    <div className="grid grid-cols-3 text-center border-b border-black p-6 text-lg font-bold">
                        <h1>Title</h1>
                        <h1>Author</h1>
                        <h1>Last Modified</h1>
                    </div>
                    {notes?.map((note: any) => (
                        <Link
                            key={note.id}
                            href={`/notes/${note.id}`}
                            className="grid grid-cols-3 text-center border-b border-black p-6 hover:font-bold"
                        >
                            <span>{note.title}</span>
                            <span>{note.authorName ? note.authorName : "-"}</span>
                            <span>{note.updatedAt.toDateString()}</span>
                        </Link>
                    )
                    )}
                </div>
            </div>
        </>
    )
}