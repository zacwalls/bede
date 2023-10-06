"use client";

import React, { useState, useEffect, Ref, useRef } from 'react'
import { MDXEditor, MDXEditorMethods, headingsPlugin } from "@mdxeditor/editor"
import '@mdxeditor/editor/style.css'

type Note = {
    id: number
    title: string
    content: string
}

// type EditorProps = {
//     markdown: string
//     editorRef?: React.MutableRefObject<MDXEditorMethods | null>
//     onChange: (markdown: string) => void
// }

// const Editor: FC<EditorProps> = ({ markdown, editorRef, onChange }: EditorProps) => {
//     return <MDXEditor ref={editorRef} markdown={markdown} onChange={onChange} plugins={[headingsPlugin()]} />
// }

// Used for selecting notes to link to
function HoveringNotesMenu() {
    const [notes, setNotes] = useState([] as Note[]);

    useEffect(() => {
        fetch('/api/notes').then(res => res.json()).then(data => {
            setNotes(data);
        }).catch(err => console.error(err));
    }, [])

    return (
        <div className="absolute z-10 w-1/4 h-1/2 bg-white border border-black">
            <div className="flex flex-col">
                {notes.map(note => (
                    <div key={note.id} className="flex flex-row">
                        <div
                            contentEditable={false}
                            className="text-sm font-bold text-gray-400"
                            onClick={() => {
                                const noteUrl = `/notes/${note.id}`;

                                // setHref(noteUrl);
                                // insertBacklink(editor, note.title, noteUrl);
                            }}
                        >
                            {note.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function NoteEditor({ note }: { note: Note }) {
    const [content, setContent] = useState(note.content);
    const [title, setTitle] = useState(note.title);
    const editorRef = useRef<MDXEditorMethods>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        const timeout = setTimeout(async () => {
            await fetch(`/api/notes/${note.id}`, {
                method: "PATCH",
                body: JSON.stringify({ newTitle: title, newContent: content }),
            });
        }, 1000);

        return () => clearTimeout(timeout);
    }, [content, title])

    return (
        <div className="w-full px-48 py-12">
            <input
                className="text-4xl font-bold mr-4 w-fit pb-6"
                type="text"
                placeholder='Title...'
                onChange={(e) => setTitle(e.target.value)}
                value={title}
            />
            <MDXEditor ref={editorRef} markdown={content} onChange={(newContent) => setContent(newContent)} plugins={[headingsPlugin()]} />
        </div>
    )
}