"use client";

import Link from 'next/link';
import { signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"

export default function Navbar({ session } : { session: Session | null }) {
    return (
        <div className="flex items-center justify-between w-full p-6">
            <h1 className="text-2xl font-bold">
                Bede
            </h1>
            <nav>
                <Link href="/notes">My Notes</Link>
            </nav>
            {session
                ? <img src={session?.user?.image as string} alt="Profile Picture" className="w-8 h-8 rounded-full" />
                : (
                    <button
                        className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500"
                        onClick={() => signIn()}
                    >
                        Sign In
                    </button>
                )
            }
        </div>
    )
  }