import React, { useEffect, useState } from "react";
import "./Bookshelf.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import {
  getBookshelf,
  viewOneBook,
} from "../../../../Service/Apiservice/UserApi";
import ContentModal from "../../../Modal/ContentModal";
import ViewBook from "./ViewBookshelf/ViewBook";
const ImageComponent = React.lazy(() =>
  import("../../../ImageComponent/Image")
);

export default function Bookshelf({ userId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModelOpen, setModel] = useState(false);
  const [shelfOwned, setShelOwned] = useState("");
  const [bookData, setBookData] = useState({});

  useEffect(() => {
    const fetechBookshelf = async () => {
      const response = await getBookshelf(userId);
      if (response) {
        setData(response.shelf);
        setShelOwned(response.userId);
      }
      setLoading(false);
    };
    fetechBookshelf();
  }, [isModelOpen]);

  const handleContentClose = () => {
    setModel(false);
  };

  const viewBookshelf = async (bookId, userId) => {
    const response = await viewOneBook(bookId, userId);
    console.log(response);
    if (response) {
      setBookData(response);
      setModel(true);
    }
  };

  return (
    <>
      <ContentModal
        isContentModalOpen={isModelOpen}
        onContentClose={handleContentClose}
      >
        <ViewBook
          book={bookData}
          isOwned={userId == shelfOwned}
          userId={userId}
          handleContentClose={handleContentClose}
        />
      </ContentModal>
      {loading ? (
        <div className="mt-6 flex justify-center items-baseline  w-full">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
          <span className="ms-3 text-gray-500">loading... </span>
        </div>
      ) : (
        <div className="post-list mt-4 pb-10 grid grid-cols-4 gap-4  mx-20">
          {data.map((book, index) => (
            <div
              key={index}
              onClick={() => viewBookshelf(book._id, userId)}
              className="shelf shadow border rounded-lg"
            >
              <div className="w-full p-1 h-[60%] ">
                <React.Suspense
                  fallback={
                    <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                  }
                >
                  <ImageComponent src={book.imageUrl.secure_url} />
                </React.Suspense>
              </div>
              <div className="px-2 py-1">
                <div className="text-md font-semibold ">{book.bookName} </div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>
                    <span className="font-bold">ID:</span> {book.ID}
                  </div>
                  <div className="font-bold text-[#512da8]">{book.status}</div>
                  <div>
                    <FontAwesomeIcon
                      className="text-red-600"
                      icon={faLocationDot}
                    />
                    <span className="ms-2">{book.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
