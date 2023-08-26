"use client";

import { useState, useEffect } from 'react'

type Note = {
    id: number
    title: string
    content: string
}

export default function Editor({ note }: { note: Note }) {
    const [content, setContent] = useState(note.content);
    const [title, setTitle] = useState(note.title);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setSaving(true);

        const timeout = setTimeout(async () => {
            await fetch(`/api/notes/${note.id}`, {
                method: "PATCH",
                body: JSON.stringify({ newContent: content, newTitle: title })
            }).then(() => setSaving(false));
        }, 500);

        return () => clearTimeout(timeout);
    }, [content, title])

    return (
        <>
            <h1>
                <input type="text" placeholder='Title...' onChange={(e) => setTitle(e.target.value)} value={title} />
                {saving && <span> (saving...)</span>}
            </h1>
            <textarea title={note.title} onChange={(e) => setContent(e.target.value)} value={content}></textarea>
        </>
    )
}