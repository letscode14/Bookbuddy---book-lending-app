import { useState } from "react";
export default function Submitotp() {
  const [error, setError] = useState(false);
  const [data, setOtp] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.entries(data).length != 1 || data.otp == "") {
      setError(2);
      setTimeout(() => {
        setError(0);
      }, 1500);
      return;
    }
  };
  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-2">Submit OTP</h1>

      <div className="w-full">
        <div
          className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
            error == 2 ? "" : "opacity-0"
          }`}
        >
          Fill the field
        </div>
        <input
          onChange={(e) => setOtp({ otp: e.target.value.trim() })}
          placeholder="Enter your otp"
        ></input>

        <div
          className={` text-xs text-red-500 transition-opacity duration-500 ${
            error == 1 ? "" : "opacity-0"
          }`}
        >
          Enter a valid email
        </div>
      </div>

      <button onClick={handleSubmit} className="sign-in-button">
        SUBMIT
      </button>
    </form>
  );
}
