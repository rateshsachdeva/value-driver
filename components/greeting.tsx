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
        <strong>Here’s how we’ll kick things off:</strong><br />
        📌 I’ll give you a quick <strong>Industry Summary</strong> — how companies in your space make money, 
        what risks to watch for, and what matters most to investors.<br />
        📊 Then, I’ll map out a detailed <strong>Value Driver Tree</strong> covering EBITDA, Working Capital, 
        Capex, and Capital Structure.
      </p>

      <p>
        After that, I’ll check in to see if you want me to prepare a tailored 
        <strong> Information Request List</strong> to help you dig deeper.
      </p>

      <p>
        Just let me know your industry or a bit about the business, and we can get started!
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
