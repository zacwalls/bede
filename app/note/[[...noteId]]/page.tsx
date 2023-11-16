import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { redirect } from 'next/navigation';

import prisma from "@/app/lib/db";
import serverSession from '@/app/lib/session';

const NoteEditor = dynamic(() => import('../../components/NoteEditor'), { ssr: false });

type User = ({
    id: string;
} & {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
}) | {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string;
}

async function createNewNote(user: User) {
    const note = await prisma.note.create({
        data: {
            title: "Untitled",
            content: "",
            userId: user.id,
            authorName: user.name ?? ""
        }
    });

    if (!note) {
        throw new Error("Failed to create note");
    }

    return note;
}

async function createNewFolder(user: User) {
    const folder = await prisma.noteFolder.create({
        data: {
            name: "Untitled Folder",
            userId: user.id,
        }
    });

    if (!folder) {
        throw new Error("Failed to create folder");
    }

    return folder;
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
        note = await createNewNote(session?.user);
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