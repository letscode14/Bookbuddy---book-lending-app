import { useEffect } from "react";
import Login from "../UserComponents/Login/Login";
import { useDispatch } from "react-redux";
import { resetAuthState } from "../../store/slice/authSlice";
import { remove500Error } from "../../store/slice/errorSlice";
import { removeOtpToken } from "../../store/slice/otpLoginAuth";

function ResetAuthState() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetAuthState());
    dispatch(remove500Error());
    dispatch(removeOtpToken());
  }, [dispatch]);
  return <Login />;
}

export default ResetAuthState;
