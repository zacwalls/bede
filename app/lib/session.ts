import { getServerSession } from 'next-auth';

import options from '@/app/api/auth/[...nextauth]/options';

async function serverSession() {
    const session = await getServerSession(options);
    return session;
}

export default serverSession;