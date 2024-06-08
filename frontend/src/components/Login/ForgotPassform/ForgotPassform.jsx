import { useState } from "react";
import { validateEmail } from "../../../../helpers/ValidationHelpers/ValidationHelper";

export default function ForgotPassform() {
  const [user, setEmail] = useState({});
  const [error, setError] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.entries(user).length == 0 || user.email == "") {
      setError(2);
      setTimeout(() => {
        setError(0);
      }, 1500);
      return;
    }
    if (!validateEmail(user.email)) {
      setError(1);
      setTimeout(() => {
        setError(0);
      }, 1500);
      return;
    }
  };

  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-2">Verify email</h1>

      <div className="w-full">
        <div
          className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
            error == 2 ? "" : "opacity-0"
          }`}
        >
          Fill the field
        </div>
        <input
          onChange={(e) => setEmail({ email: e.target.value.trim() })}
          placeholder="Email"
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
        VERIFY
      </button>
    </form>
  );
}
