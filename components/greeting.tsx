'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const Greeting = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isGuest = session?.user?.email?.startsWith('guest');

  return (
    <div className="max-w-3xl mx-auto md:mt-20 px-8 py-4 text-gray-800 space-y-4">
      <h2 className="text-xl font-semibold">
        Hi there — welcome! I’m your financial analysis and diligence assistant.
      </h2>

      <p>
        First, I’ll share an Industry Summary and a detailed Value Driver Tree. Then, I’ll check if you’d like a tailored Information Request List.

Just tell me your industry or business, and we’re off!
      </p>

      {status === 'loading' ? (
        <p>Checking login status...</p>
      ) : session?.user && !isGuest ? (
        <p className="text-green-700 font-semibold">
          ✅ You are logged in as <code>{session.user.email}</code>
        </p>
      ) : (
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Login to your account
          </button>
          <button
            onClick={() => router.push('/chat')}
            className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            Continue as Guest
          </button>
        </div>
      )}
    </div>
  );
};
