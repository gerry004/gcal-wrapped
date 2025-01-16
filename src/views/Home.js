import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className='w-full h-screen flex flex-col justify-center items-center'>
        <h1>Google Calendar Wrapped</h1>
      </div>
    </>
  );
};

export default Home;