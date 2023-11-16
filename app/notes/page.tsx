import Link from 'next/link';

import NotesActions from '@/app/components/NotesActions';
import serverSession from '@/app/lib/session';
import prisma from "@/app/lib/db";

export default async function NotesPage() {
    const session = await serverSession();

    if (!session) {
        return (
            <div>
                <h1>Not logged in</h1>
            </div>
        )
    }

    const notes = await prisma.note.findMany({
        where: {
            userId: session?.user?.id
        }
    }) || [];

    const folders = await prisma.noteFolder.findMany({
        where: {
            userId: session?.user?.id
        }
    }) || [];

    return (
        <>
            <div className="flex flex-col items-center justify-center w-full">
                <NotesActions userId={session.user.id} />
                <div className="flex flex-col w-full">
                    <div className="grid grid-cols-3 text-center border-b border-black p-6 text-lg font-bold">
                        <h1>Title</h1>
                        <h1>Author</h1>
                        <h1>Last Modified</h1>
                    </div>
                    {folders.map((folder) => (
                        <div
                            key={folder.id}
                            className="grid grid-cols-3 text-center border-b border-black p-6 hover:font-bold"
                        >
                            <span>{folder.name}</span>
                            <span>{folder.userId}</span>
                            <span>{folder.updatedAt.toDateString()}</span>
                        </div>
                    ))}
                    {notes?.map((note) => (
                        <Link
                            key={note.id}
                            href={`/note/${note.id}`}
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
    );
}