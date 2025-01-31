"use client";
import Image from "next/image";
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push('/wrapped');
  };

  return (
    <div className="min-h-screen p-8 bg-white flex items-center justify-center">
      <Navbar />
      <div className="flex justify-center mt-8">
        <form onSubmit={handleSubmit} className="border border-gray-300 rounded-lg p-6 shadow-md bg-white">
          <input
            type="text"
            placeholder="Enter something..."
            className="border border-gray-300 p-2 rounded mb-4 w-full"
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
