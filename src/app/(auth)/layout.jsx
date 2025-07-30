import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Authentication</h1>
        <p className="text-gray-600 mb-6 text-center">
          Please sign in or create an account
        </p>
        {children}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
