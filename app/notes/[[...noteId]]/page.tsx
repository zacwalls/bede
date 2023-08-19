import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Session } from 'next-auth';
import { PrismaClient } from '@prisma/client';

import { getServerSession } from "../../layout";
import Editor from '../../components/Editor'

async function createNewNote(prisma: PrismaClient, userId: string) {
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

async function NoteEditor({ noteId, prisma, session }: { noteId: string, prisma: PrismaClient, session: Session }) {
    let note;

    if (noteId === "new") {
        note = await createNewNote(prisma, session?.user?.id);
        redirect(`/notes/${note.id}`);
    } else {
        note = await prisma.note.findUnique({
            where: {
                id: parseInt(noteId)
            }
        });


        if (!note) {
            throw new Error("Note not found");
        }
    }

    return (
        <Editor noteContent={note.content}></Editor>
    )
}

export default async function Note({ params }: { params: { noteId: string[] } }) {
    const session = await getServerSession();
    const prisma = new PrismaClient();

    if (!session) {
        return (
            <div>
                <h1>Not logged in</h1>
            </div>
        )
    }

    if (params.noteId && params.noteId[0]) {
        return <NoteEditor noteId={params.noteId[0]} prisma={prisma} session={session} />;
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