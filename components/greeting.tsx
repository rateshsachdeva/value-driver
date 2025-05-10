'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const Greeting = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isGuest = session?.user?.email?.startsWith('guest');

  return (
    <div className="max-w-3xl mx-auto md:mt-20 px-8 py-4 text-gray-800 dark:text-gray-200 space-y-4">
      <h2 className="text-xl font-semibold">
        I’m your financial analysis and diligence assistant — here to help with industry insights and value drivers.
      </h2>

      <p>
        📌 First, I’ll share an Industry Summary and a Value Driver Tree. Then, I can help draft an Information Request List.
        <br />
        Just tell me your industry or business, and we can begin!
      </p>

      {status === 'loading' ? (
        <p>Checking login status...</p>
      ) : session?.user && !isGuest ? (
        <p className="text-green-700 dark:text-green-400 font-semibold">
          ✅ You are logged in as <code>{session.user.email}</code>
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Login/Sign-up to your account
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            You can continue as guest, but saving chats and some features will be limited.
          </p>
        </div>
      )}
    </div>
  );
};
