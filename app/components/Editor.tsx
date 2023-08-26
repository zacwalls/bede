"use client";

import { useState, useEffect } from 'react'

type Note = {
    id: number
    title: string
    content: string
}

export default function Editor({ note }: { note: Note }) {
    const [content, setContent] = useState(note.content);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            await fetch(`/api/notes/${note.id}`, {
                method: "PATCH",
                body: JSON.stringify({ newContent: content })
            });
        }, 500);

        return () => clearTimeout(timeout);
    }, [content])

    return (<textarea title={note.title} onChange={(e) => setContent(e.target.value)} value={content}></textarea>)
}