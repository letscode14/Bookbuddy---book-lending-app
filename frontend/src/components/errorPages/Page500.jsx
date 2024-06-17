import { useSelector } from "react-redux";
import { selectError } from "../../store/slice/errorSlice";
export default function Page500() {
  const { error500 } = useSelector(selectError);
  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center">
        <div>
          <span className="font-bold text-[150px] text-zinc-400 ">500</span>

          <span className="ms-5 font-semibold text-red-500 text-3xl">
            Internal Server Error
          </span>
          <div className="text-[22px]">Oops Something wend wrong</div>
          <div className="text-[18px]">{error500}</div>
        </div>
      </div>
    </>
  );
}
