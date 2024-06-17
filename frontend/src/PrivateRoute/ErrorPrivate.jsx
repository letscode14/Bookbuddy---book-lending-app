import { useSelector } from "react-redux";
import { selectError } from "../store/slice/errorSlice";
import { Navigate, Outlet } from "react-router-dom";
export default function ErrorPrivate() {
  const { error500 } = useSelector(selectError);
  return error500 ? <Outlet /> : <Navigate to="/login" />;
}
