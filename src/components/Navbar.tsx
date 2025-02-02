"use client";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('calendarEvents');
      localStorage.removeItem('calendarDateRange');

      // Make the logout API call
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setIsAuthenticated(false);
      
      // Navigate to homepage
      router.push('/');
      
      // Reload the page to reset all states
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav
      id="navbar"
      className="flex flex-row justify-between items-center h-16 px-6 py-2 fixed top-0 right-0 left-0 bg-blue-500 z-50"
    >
      <h2 className="text-white font-bold text-xl">
        <Link href="/">Google Calendar Wrapped</Link>
      </h2>
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
        >
          Log Out
        </button>
      )}
    </nav>
  );
};

export default Navbar; 