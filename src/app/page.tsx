"use client";
import Image from "next/image";
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import InputForm from '@/components/InputForm';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-8 bg-white flex items-center justify-center">
      <Navbar />
      <div className="flex justify-center mt-8 w-[500px]">
        <InputForm />
      </div>
    </div>
  );
}
