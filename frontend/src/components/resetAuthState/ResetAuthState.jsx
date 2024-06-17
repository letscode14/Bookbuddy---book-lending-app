import { useEffect } from "react";
import Login from "../UserComponents/Login/Login";
import { useDispatch } from "react-redux";
import { resetAuthState } from "../../store/slice/authSlice";
import { remove500Error } from "../../store/slice/errorSlice";

function ResetAuthState() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetAuthState());
    dispatch(remove500Error());
  }, [dispatch]);
  return <Login />;
}

export default ResetAuthState;
