import googleLogo from "/images/google-logo-9808.png";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import app from "../../firebase/Firebase";
import { useDispatch } from "react-redux";
import axiosInstance from "../../api/axios";
import { saveUser } from "../../store/slice/userAuth";
import { useNavigate } from "react-router-dom";
import {
  startPageLoading,
  stopPageLoading,
} from "../../store/slice/pageLoadingSlice";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const body = {
        userName: result.user.displayName,
        name: result.user.displayName.split(" ")[0],
        email: result.user.email,
        profileUrl: result.user.photoURL,
      };
      await axiosInstance
        .post("/user/google/auth", body)
        .then((response) => {
          console.log(response);
          if (response.status == 200 || response.status == 201) {
            dispatch(startPageLoading());
            setTimeout(() => {
              const obj = {
                accessToken: response.data.authToken,
                user: { ...response.data.result },
              };
              dispatch(saveUser(obj));
              dispatch(stopPageLoading());
              navigate("/user/home");
            }, 3000);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      console.log(body);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      onClick={handleGoogleAuth}
      className="cursor-pointer hover:scale-110 duration-300 google-auth-button me-2 flex items-center justify-center"
    >
      <img className="google-auth-icon " src={googleLogo} alt="" />
    </div>
  );
}
