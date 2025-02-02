"use client";

import Navbar from '@/components/Navbar';
import InputForm from '@/components/InputForm';

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-white flex items-center justify-center">
      <Navbar />
      <div className="flex justify-center mt-8">
        <InputForm />
      </div>
    </div>
  );
}
