import Navbar from "../components/Navbar";
import TextInput from "../components/TextInput";
import { useState } from "react";

const Home = () => {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    console.log("iCal URL submitted:", url);
  };

  return (
    <>
      <Navbar />
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center p-12 rounded-lg bg-primary text-white">
          <h2 className="text-white mb-6">
            Enter iCal URL
          </h2>
          <TextInput
            value={url}
            onChange={setUrl}
            placeholder="Paste your iCal URL here"
            backgroundColor="#f9fafb"
          />
          <button
            onClick={handleSubmit}
            className="bg-white w-full text-primary p-3 mt-4 font-semibold rounded-lg hover:bg-opacity-80"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
