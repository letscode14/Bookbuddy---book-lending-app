import { useEffect } from "react";
import Login from "../UserComponents/Login/Login";
import { useDispatch } from "react-redux";
import { resetAuthState } from "../../store/slice/authSlice";

function ResetAuthState() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);
  return <Login />;
}

export default ResetAuthState;
