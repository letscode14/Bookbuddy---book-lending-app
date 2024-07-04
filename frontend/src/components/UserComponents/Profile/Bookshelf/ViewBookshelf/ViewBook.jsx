import {
  faLocationDot,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import ChildModal from "../../../../Modal/ChildModal";
import EditShelf from "../EditShelf/EditShelf";
import RemoveBook from "../RemoveBook/RemoveBook";
const ImageComponent = React.lazy(() =>
  import("../../../../ImageComponent/Image")
);

export default function ViewBook({
  book,
  isOwned,
  userId,
  handleContentClose,
}) {
  const [isChildOpen, setChildOpen] = useState(false);
  const [modalFor, setModalFor] = useState("");
  const [action, setAction] = useState("");

  book.addedOn = new Date(book.addedOn).toDateString();

  const handleChildClose = () => {
    setChildOpen(false);
    setModalFor("");
    setAction("");
  };

  const confirmEdit = () => {
    setModalFor("Confirm");
    setChildOpen(true);
    setAction("Edit");
  };

  const confirmRemove = () => {
    setModalFor("Confirm");
    setChildOpen(true);
    setAction("Remove");
  };

  const handleConfirm = () => {
    if (action == "Edit") return setModalFor("Edit");
    if (action == "Remove") return setModalFor("Remove");
  };

  const handleClose = () => {
    handleContentClose();
    setModalFor("");
    setAction("");
  };

  return (
    <>
      <ChildModal isOpen={isChildOpen} onClose={handleChildClose}>
        {modalFor == "Confirm" && (
          <div className="w-[500px] py-6 px-10">
            <div>
              <span>
                <FontAwesomeIcon
                  className="text-2xl text-red-400 me-5"
                  icon={faTriangleExclamation}
                />
              </span>
              Are you sure?
            </div>
            <div className="text-end  mt-5">
              <div>
                <button
                  onClick={() => {
                    handleChildClose();
                  }}
                  className="me-3 py-1 bg-[#512da8] text-[#ffffff] font-semibold uppercase px-5 text-xs border rounded-lg"
                >
                  cancel
                </button>

                <button
                  onClick={handleConfirm}
                  className="py-1 bg-red-400 text-[#ffffff] font-semibold uppercase px-5 text-xs border rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        {modalFor == "Edit" && (
          <EditShelf book={book} userId={userId} handleClose={handleClose} />
        )}
        {modalFor == "Remove" && (
          <RemoveBook
            bookId={book.ID}
            _id={book._id}
            userId={userId}
            handleClose={handleClose}
          />
        )}
      </ChildModal>
      <div className="w-[400px] p-4 h-[380px]">
        <div className=" h-[37%]">
          <div className="flex h-full">
            <div className="h-full p-1 w-[40%]">
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <ImageComponent src={book.imageUrl.secure_url} />
              </React.Suspense>
            </div>
            <div className="ms-2 w-[60%] ">
              <div className="text-xl font-semibold">{book.bookName}</div>
              <div className="text-md ">{book.author}</div>
              <div className="text-md ">
                <span className="font-bold">ID:</span>
                {book.ID}
              </div>
              <div className="text-md ">{book.addedOn}</div>
            </div>
          </div>
        </div>
        <div className="h-[23%] text-gray-400 text-sm font-semibold mt-3">
          <div className="flex">
            <div className=" flex justify-between w-[85px]">
              <span>Status</span>
              <span>:</span>
            </div>
            <span className="text-[#512da8] ms-2 font-semibold">
              {book.status}
            </span>
          </div>
          <div className="flex">
            <div className=" flex justify-between w-[85px]">
              <span>Location</span>
              <span>:</span>
            </div>
            <span className=" ms-2 font-semibold">
              <FontAwesomeIcon
                className="text-red-500 mx-1 "
                icon={faLocationDot}
              />
              {book.location}
            </span>
          </div>
          <div className="flex">
            <div className=" flex justify-between w-[85px]">
              <span>Limit</span>
              <span>:</span>
            </div>
            <span className="  ms-2 font-semibold">{book.limit} Day</span>
          </div>
        </div>
        <div
          style={{ scrollbarWidth: "none" }}
          className="mb-5 h-16 max-h-16 overflow-auto  font-medium text-[#000000]"
        >
          <p className="text-wrap w-50">{book.description}</p>
        </div>
        <div className="  w-full  flex gap-3 justify-center font-medium text-[#000000]">
          <button
            onClick={() => {
              confirmEdit();
            }}
            className="border  bg-[#512da8] font-semibold text-[#ffffff] w-28 text-xs py-2 rounded-lg uppercase"
          >
            Edit
          </button>
          <button
            onClick={confirmRemove}
            className="border border-[#512da8] text-[#512da8] text-xs font-semibold   w-28 text-sm py-1 rounded-lg uppercase"
          >
            remove
          </button>
        </div>
      </div>
    </>
  );
}
