"use client";

import Link from 'next/link';

export default function NotesActions({ userId }: { userId: string }) {
    async function newFolder() {
        const request = await fetch('/api/folders', {
            method: "POST",
            body: JSON.stringify({ userId: userId })
        });

        if (!request.ok) {
            alert("Unable to create new folder");
            return;
        }
    }

    return (
        <div className="flex justify-between w-full self-start flex-row-reverse p-4">
            <div className="px-4 py-2 border border-black">
                <Link href="/note/new">New Note</Link>
            </div>
            <div className="px-4 py-2 border border-black">
                <a onClick={async () => await newFolder()}>New Folder</a>
            </div>
        </div>
    )
}