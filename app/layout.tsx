import { Session } from 'next-auth'

import serverSession from './lib/session';
import Navbar from './components/Navbar';
import AuthContext from './AuthContext';
import './globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await serverSession();

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthContext session={session as Session}>
        <main className="flex min-h-screen flex-col items-center">
          <Navbar session={session} />
          {children}
        </main>
        </AuthContext>
      </body>
    </html>
  )
}
