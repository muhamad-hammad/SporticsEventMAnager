import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6 animate-fade-in">
            Sportics Event Manager
          </h1>
          <p className="text-2xl mb-12 opacity-90">
            Manage sports events, teams, and bookings with ease
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/register"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300 transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
}
