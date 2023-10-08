"use client";

import { useState, RefObject, useRef, } from 'react'
import {
    MDXEditor,
    MDXEditorMethods,
    MDXEditorProps,
    diffSourcePlugin,
    markdownShortcutPlugin,
    frontmatterPlugin,
    headingsPlugin,
    imagePlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    codeBlockPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    Separator,
    CodeToggle,
    ListsToggle,
    BlockTypeSelect,
    CreateLink,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    DiffSourceToggleWrapper,
} from "@mdxeditor/editor"
import '@mdxeditor/editor/style.css'

type Note = {
    id: number
    title: string
    content: string
}

export default function NoteEditor({ note }: { note: Note }) {
    const [title, setTitle] = useState(note.title);
    const editorRef = useRef<MDXEditorProps | null>(null);
    const initialValue = note.content;

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
                    toolbarPlugin({
                        toolbarContents: () => (
                            <DiffSourceToggleWrapper>
                                <UndoRedo />
                                <Separator />
                                <BoldItalicUnderlineToggles />
                                <CodeToggle />
                                <Separator />
                                <ListsToggle />
                                <Separator />
                                <BlockTypeSelect />
                                <Separator />
                                <CreateLink />
                                <InsertImage />
                                <Separator />
                                <InsertTable />
                                <InsertThematicBreak />
                            </DiffSourceToggleWrapper>
                        )
                    }),
                    headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
                    listsPlugin(),
                    linkPlugin(),
                    quotePlugin(),
                    linkPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                    thematicBreakPlugin(),
                    frontmatterPlugin(),
                    codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
                    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: initialValue }),
                    linkDialogPlugin()
                ]}
            />
        </div>
    )
}