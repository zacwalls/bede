"use client";

import { useState } from 'react'

export default function Editor({ noteContent }: { noteContent: string }) {
    const [content, setContent] = useState(noteContent);

    return (<textarea title='Note' onChange={(e) => setContent(e.target.value)} value={content}></textarea>)
}