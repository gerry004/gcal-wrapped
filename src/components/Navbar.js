import { Link } from "react-router-dom";

function Navbar() {

  return (
    <nav
      id="navbar"
      className="hidden md:flex flex-row justify-center h-16 px-6 py-2 fixed top-0 right-0 left-0 bg-primary z-50"
    >
      <Link to="/" className="hidden md:block m-2 text-white hover:underline underline-offset-2 text-2xl font-semibold hover:animate-jump">
        Calendar Wrapped
      </Link>
      <div className="flex flex-row justify-center items-center ml-auto">
        <Link to="/dashboard" className="m-2 text-white hover:underline underline-offset-2">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
export default Navbar;
