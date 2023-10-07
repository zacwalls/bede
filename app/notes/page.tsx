import Link from 'next/link';

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