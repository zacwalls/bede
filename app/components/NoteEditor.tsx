"use client";

import { useState, useEffect, RefObject, useRef, FC, forwardRef } from 'react'
import {
    MDXEditor,
    MDXEditorMethods,
    MDXEditorProps,
    headingsPlugin,
    markdownShortcutPlugin,
    listsPlugin,
    linkPlugin,
    quotePlugin
} from "@mdxeditor/editor"
import '@mdxeditor/editor/style.css'

type Note = {
    id: number
    title: string
    content: string
}

interface EditorProps {
    markdown: string
    onChange: (markdown: string) => void
}

// const Editor: FC<EditorProps> = ({ markdown, editorRef, onChange }: EditorProps) => {
//     return <MDXEditor ref={editorRef} markdown={markdown} onChange={onChange} plugins={[headingsPlugin()]} />
// }

// const MDXEditor = forwardRef((props: MDXEditorProps, ref) => {
//     return <Editor {...props} ref={ref as RefObject<MDXEditorMethods>} />
// })

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
    const [title, setTitle] = useState(note.title);
    const editorRef = useRef<MDXEditorProps | null>(null);

    async function updateNote(newTitle: string, newContent: string) {
        if (!editorRef.current) return

        const timeout = setTimeout(async () => {
            await fetch(`/api/notes/${note.id}`, {
                method: "PATCH",
                body: JSON.stringify({ newTitle, newContent })
            });
        }, 1000);

        return () => clearTimeout(timeout);
    }

    return (
        <div className="w-full px-48 py-12">
            <input
                className="text-4xl font-bold mr-4 w-fit pb-6"
                type="text"
                placeholder='Title...'
                onChange={(e) => {
                    setTitle(e.target.value)
                    updateNote(title, editorRef.current?.markdown as string)
                }}
                value={title}
            />
            <MDXEditor
                autoFocus
                className="mxeditor"
                ref={editorRef as RefObject<MDXEditorMethods>}
                markdown={note.content}
                onChange={(newContent) => updateNote(title, newContent)}
                plugins={[
                    markdownShortcutPlugin(),
                    headingsPlugin(),
                    listsPlugin(),
                    linkPlugin(),
                    quotePlugin(),
                ]}
            />
        </div>
    )
}