"use client";

import Link from 'next/link';
import { useSession } from "next-auth/react";


export default function Home() {
  const { data: session } = useSession()

  console.log()

  return (<h1>Welcome!</h1>)
}
