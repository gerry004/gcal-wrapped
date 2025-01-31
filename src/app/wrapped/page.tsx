"use client";
import Navbar from '@/components/Navbar';

export default function Wrapped() {
  return (
    <div className="min-h-screen p-8 bg-white">
      <Navbar />
      <h1 className="text-2xl text-center mt-8">This is the Wrapped Page!</h1>
      <p className="text-center">You have successfully navigated to the wrapped page.</p>
    </div>
  );
} 