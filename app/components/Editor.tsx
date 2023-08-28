"use client";

import { useState, useEffect, useRef, forwardRef, Ref } from 'react'
import { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';
import dynamic from 'next/dynamic'
import '@mdxeditor/editor/style.css'
import { headingsPlugin } from '@mdxeditor/editor/plugins/headings'
import { listsPlugin } from '@mdxeditor/editor/plugins/lists'
import { quotePlugin } from '@mdxeditor/editor/plugins/quote'

type Note = {
    id: number
    title: string
    content: string
}

const EditorPlugins = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin()
]

const MDXEditor = dynamic(
    () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
    { ssr: false }
)

const EditorWithRef = forwardRef((props: MDXEditorProps, ref: Ref<MDXEditorMethods>) => <MDXEditor ref={ref} {...props} />)

export default function Editor({ note }: { note: Note }) {
    const [content, setContent] = useState(note.content);
    const [title, setTitle] = useState(note.title);
    const [modified, setNodified] = useState(false);
    const [saving, setSaving] = useState(false);
    const editorRef = useRef<MDXEditorMethods>(null);

    function handleNoteChange(value: string, setter: (value: string) => void) {
        setNodified(true);
        setter(value);
    }

    useEffect(() => {
        if (!modified) return;

        setSaving(true);

        const timeout = setTimeout(async () => {
            await fetch(`/api/notes/${note.id}`, {
                method: "PATCH",
                body: JSON.stringify({ newContent: content, newTitle: title })
            }).then(() => editorRef.current?.setMarkdown(content));
        }, 500);

        setSaving(false);

        return () => clearTimeout(timeout);
    }, [content, title])

    return (
        <>
            <h1>
                <input type="text" placeholder='Title...' onChange={(e) => handleNoteChange(e.target.value, setTitle)} value={title} />
                {saving && <span> (saving...)</span>}
            </h1>
            <EditorWithRef ref={editorRef} plugins={EditorPlugins} markdown={content} onChange={(value) => handleNoteChange(value, setContent)} />
        </>
    )
}