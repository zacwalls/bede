"use client";

import { useState, useEffect } from 'react'
import { createEditor, BaseEditor, Descendant } from 'slate';
import { Slate, Editable, withReact, ReactEditor, } from 'slate-react';

type Note = {
    id: number
    title: string
    content: string
}

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor
        Element: CustomElement
        Text: CustomText
    }
}

export default function Editor({ note }: { note: Note }) {
    const [editor] = useState(() => withReact(createEditor()))
    const [content, setContent] = useState((note.content || JSON.stringify([
        {
            type: 'paragraph',
            children: [{ text: 'A line of text in a paragraph.' }],
        },
    ])));
    const [title, setTitle] = useState(note.title);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setSaving(true);

        const timeout = setTimeout(async () => {
            await fetch(`/api/notes/${note.id}`, {
                method: "PATCH",
                body: JSON.stringify({ newTitle: title, newContent: content }),
            }).then(() => setSaving(false));
        }, 1000);

        return () => clearTimeout(timeout);
    }, [content, title])

    return (
        <div className="w-full p-6">
            <h1 className="text-2xl py-2">
                <input
                    type="text"
                    placeholder='Title...'
                    onChange={(e) => setTitle(e.target.value)} 
                    value={title}
                />
                {saving && <span> (saving...)</span>}
            </h1>
            <Slate
                editor={editor}
                onChange={value => {
                    const isAstChange = editor.operations.some(
                        op => 'set_selection' !== op.type
                    )
                    if (isAstChange) {
                        setContent(JSON.stringify(value))
                    }
                }}
                initialValue={JSON.parse(content)}
            >
                <Editable />
            </Slate>
        </div>
    )
}