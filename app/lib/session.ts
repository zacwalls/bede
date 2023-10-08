import { getServerSession } from 'next-auth';

import options from '@/app/api/auth/[...nextauth]/options';

async function serverSession() {
    const session = await getServerSession(options);

    if (process.env.NEXTAUTH_TESTING_SESSION && !session) {
        return {
            user: {
                id: "test-user-id",
                name: 'test',
                email: 'test@example.com',
                emailVerified: true,
                image: 'https://avatars.githubusercontent.com/u/41216551?v=4',
            },
        };
    }

    return session;
}

export default serverSession;