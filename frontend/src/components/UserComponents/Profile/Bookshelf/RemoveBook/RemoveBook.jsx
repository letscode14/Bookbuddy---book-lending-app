import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { removeFromShelf } from "../../../../../Service/Apiservice/UserApi";
import { showSuccessToast } from "../../../../../utils/toast";

export default function RemoveBook({ bookId, _id, userId, handleClose }) {
  const [proceed, setProceed] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const remove = async (shelfId, userId) => {
    if (!proceed) {
      return;
    }
    setLoading(true);

    const response = await removeFromShelf({ shelfId, userId });
    if (response) {
      setLoading(false);
      showSuccessToast("Book removed successfully");
      setProceed(false);
      handleClose();
    }
  };
  return (
    <div className="w-[600px] h-[260px] p-6">
      <div>
        <div className="font-semibold">BOOK ID : {bookId}</div>
        <div className="text-[15px] text-gray-600 mt-1">
          <FontAwesomeIcon
            className="text-red-400"
            icon={faCircleExclamation}
          />
          <span className="ms-1">Note !</span>
        </div>
        <div className="text-[13px] text-gray-500">
          This action will permanently remove the book from bookshelf which no
          longer be avilable to lend. The post regarding this book remains the
          same remains the same. please type the exact BOOK ID in the field to
          proceed further
        </div>
        <div className="sm:col-span-3 mt-2">
          <label
            htmlFor="first-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Type {bookId}
          </label>
          <div className="mt-1">
            <input
              onChange={(e) => {
                if (e.target.value == bookId) {
                  setProceed(true);
                }
              }}
              type="text"
              name="first-name"
              id="first-name"
              autoComplete="given-name"
              className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => remove(_id, userId)}
            className={`w-32 ${
              proceed ? "" : "opacity-50"
            } text-xs uppercase flex justify-center rounded-lg text-[#ffffff] bg-[#512da8] py-2 border mt-3`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
            ) : (
              "remove"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
