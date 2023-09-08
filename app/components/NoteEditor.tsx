"use client";

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    createEditor,
    Descendant,
    Editor,
    BaseEditor,
    Element as SlateElement,
    Node as SlateNode,
    Point,
    Range,
    Transforms,
} from 'slate'
import { Slate, Editable, withReact, ReactEditor, RenderLeafProps, RenderElementProps, } from 'slate-react';
import { withHistory } from 'slate-history'
import Link from 'next/link';

type Note = {
    id: number
    title: string
    content: string
}

const SHORTCUTS = {
    '1.': 'ol-list-item',
    '-': 'ul-list-item',
    '>': 'block-quote',
    '#': 'heading-one',
    '##': 'heading-two',
    '###': 'heading-three',
    '####': 'heading-four',
    '#####': 'heading-five',
    '######': 'heading-six',
    '[': 'backlink',
}

const withShortcuts = editor => {
    const { deleteBackward, insertText } = editor

    editor.insertText = text => {
        const { selection } = editor

        if (text.endsWith(' ') && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection
            const block = Editor.above(editor, {
                match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
            })
            const path = block ? block[1] : []
            const start = Editor.start(editor, path)
            const range = { anchor, focus: start }
            const beforeText = Editor.string(editor, range) + text.slice(0, -1)
            const type = SHORTCUTS[beforeText]

            if (type) {
                Transforms.select(editor, range)

                if (!Range.isCollapsed(range)) {
                    Transforms.delete(editor)
                }

                const newProperties: Partial<SlateElement> = {
                    type,
                }
                Transforms.setNodes<SlateElement>(editor, newProperties, {
                    match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
                })

                if (type === 'ol-list-item') {
                    const list = {
                        type: 'numbered-list',
                        children: [],
                    }
                    Transforms.wrapNodes(editor, list, {
                        match: n =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === 'ol-list-item',
                    })
                }

                if (type === 'ul-list-item') {
                    const list = {
                        type: 'bulleted-list',
                        children: [],
                    }
                    Transforms.wrapNodes(editor, list, {
                        match: n =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === 'ul-list-item',
                    })
                }

                return
            }
        }

        insertText(text)
    }

    editor.deleteBackward = (...args: any[]) => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, {
                match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
            })

            if (match) {
                const [block, path] = match
                const start = Editor.start(editor, path)

                if (
                    !Editor.isEditor(block) &&
                    SlateElement.isElement(block) &&
                    block.type !== 'paragraph' &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties: Partial<SlateElement> = {
                        type: 'paragraph',
                    }
                    Transforms.setNodes(editor, newProperties)

                    if (block.type === 'ul-list-item') {
                        Transforms.unwrapNodes(editor, {
                            match: n =>
                                !Editor.isEditor(n) &&
                                SlateElement.isElement(n) &&
                                n.type === 'bulleted-list',
                            split: true,
                        })
                    }

                    if (block.type === 'ol-list-item') {
                        Transforms.unwrapNodes(editor, {
                            match: n =>
                                !Editor.isEditor(n) &&
                                SlateElement.isElement(n) &&
                                n.type === 'numbered-list',
                            split: true,
                        })
                    }

                    return
                }
            }

            deleteBackward(...args)
        }
    }

    return editor
}

// Used for selecting notes to link to
function NotesMenu({ notes, setHref }: { notes: Note[], setHref: (title: string) => void }) {
    return (
        <div className="absolute z-10 w-1/4 h-1/2 bg-white border border-black">
            <div className="flex flex-col">
                {notes.map(note => (
                    <div className="flex flex-row">
                        <div className="text-sm font-bold text-gray-400" contentEditable={false} onClick={(e) => setHref(`/notes/${note.id}`)}>{note.title}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function Backlink({ attributes, children }: RenderElementProps) {
    const [href, setHref] = useState("");
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        fetch('/api/notes').then(res => res.json()).then(data => {
            setNotes(data);
        }).catch(err => console.error(err));
    }, [])

    return (
        <div  {...attributes}>
            {!href && <NotesMenu notes={notes} setHref={setHref} />}
            <Link href={href} className="flex flex-col text-blue-600">{children}</Link>
        </div>
    )
}

const Element = (props: RenderElementProps) => {
    switch (props.element.type) {
        case 'block-quote':
            return <blockquote {...props.attributes}>{props.children}</blockquote>
        case 'backlink':
            return <Backlink {...props}>{props.children}</Backlink> 
        case 'numbered-list':
            return <ol className="list-decimal pl-4" {...props.attributes}>{props.children}</ol>
        case 'bulleted-list':
            return <ul className="list-disc pl-4" {...props.attributes}>{props.children}</ul>
        case 'heading-one':
            return <h1 className="text-6xl" {...props.attributes}>{props.children}</h1>
        case 'heading-two':
            return <h2 className="text-5xl" {...props.attributes}>{props.children}</h2>
        case 'heading-three':
            return <h3 className="text-3xl" {...props.attributes}>{props.children}</h3>
        case 'heading-four':
            return <h4 className="text-2xl" {...props.attributes}>{props.children}</h4>
        case 'heading-five':
            return <h5 className="text-xl" {...props.attributes}>{props.children}</h5>
        case 'heading-six':
            return <h6 className="text-lg" {...props.attributes}>{props.children}</h6>
        case 'ul-list-item':
        case 'ol-list-item':
            return <li {...props.attributes}>{props.children}</li>
        default:
            return <p {...props.attributes}>{props.children}</p>
    }
}


export default function NoteEditor({ note }: { note: Note }) {
    const [content, setContent] = useState((note.content || JSON.stringify([
        {
            type: 'paragraph',
            children: [{ text: '' }],
        },
    ])));
    const [title, setTitle] = useState(note.title);
    const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
    const editor = useMemo(
        () => withShortcuts(withReact(withHistory(createEditor()))),
        []
    )

    const handleDOMBeforeInput = useCallback(
        (e: InputEvent) => {
            queueMicrotask(() => {
                const pendingDiffs = ReactEditor.androidPendingDiffs(editor)

                const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
                    if (!diff.text.endsWith(' ')) {
                        return false
                    }

                    const { text } = SlateNode.leaf(editor, path)
                    const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1)
                    if (!(beforeText in SHORTCUTS)) {
                        return
                    }

                    const blockEntry = Editor.above(editor, {
                        at: path,
                        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
                    })
                    if (!blockEntry) {
                        return false
                    }

                    const [, blockPath] = blockEntry
                    return Editor.isStart(editor, Editor.start(editor, path), blockPath)
                })

                if (scheduleFlush) {
                    ReactEditor.androidScheduleFlush(editor)
                }
            })
        },
        [editor]
    )

    useEffect(() => {
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
            <Slate
                editor={editor}
                onChange={value => {
                    const isAstChange = editor.operations.some(
                        (op: any) => 'set_selection' !== op.type
                    )
                    if (isAstChange) {
                        setContent(JSON.stringify(value))
                    }
                }}
                initialValue={JSON.parse(content)}
            >
                <Editable
                    onDOMBeforeInput={handleDOMBeforeInput}
                    renderElement={renderElement}
                    spellCheck
                    autoFocus
                />
            </Slate>
        </div>
    )
}