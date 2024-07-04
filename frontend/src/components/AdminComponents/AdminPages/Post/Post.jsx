import React, { useEffect, useState } from "react";
import { useConfirmationModal } from "../../../Modal/ModalContext";
import { getPost, getReports } from "../../../../Service/Apiservice/AdminApi";
import {
  faBan,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faEye,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ContentModal from "../../../Modal/ContentModal";
import ViewReports from "./ViewReports/ViewReports";
const ImageComponent = React.lazy(() =>
  import("../../../ImageComponent/Image")
);

export default function Post() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");

  const [pageNo, setPageNo] = useState(1);
  const [totalPage, setTotalpage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { showModal } = useConfirmationModal();
  const [reports, setReports] = useState([]);
  const [isModelOpen, setModelOpen] = useState(false);

  useEffect(() => {
    document.title = "Post management";
    async function fetchPost() {
      const response = await getPost({ fetch: filter, pageNo: pageNo });
      if (response) {
        const filteredResponse = response.post.map((p) => {
          p.updatedAt = new Date(p.updatedAt).toDateString();
          p.createdAt = new Date(p.createdAt).toDateString();
          return p;
        });

        setData(filteredResponse);
        setTotalpage(response.totalPage);
      }
      setLoading(false);
    }
    fetchPost();
  }, [pageNo, filter, isModelOpen]);

  const viewReports = async (targetId) => {
    const response = await getReports(targetId);
    if (response) {
      setReports(response);
      setModelOpen(true);
    }
  };

  const handleContentClose = () => {
    setModelOpen(false);
  };

  return (
    <div className="bg-[#ffffff] max-h-[800px] h-[800px] relative rounded-2xl mt-4">
      <ContentModal
        isContentModalOpen={isModelOpen}
        onContentClose={handleContentClose}
      >
        <ViewReports reports={reports} />
      </ContentModal>
      <div className="absolute text-xl right-10 bottom-10 flex justify-center items-center gap-2">
        <FontAwesomeIcon
          icon={faChevronLeft}
          onClick={() => {
            if (pageNo > 1) {
              setPageNo(pageNo - 1);
            }
          }}
        />
        <div className="border bg-[#51557E] text-[#ffffff] text-sm px-3 py-1 rounded-lg">
          {pageNo}
        </div>
        <FontAwesomeIcon
          icon={faChevronRight}
          onClick={() => {
            if (pageNo < totalPage) {
              setPageNo(pageNo + 1);
            }
          }}
        />
      </div>
      <div className="h-20 flex gap-9 items-center">
        <div>
          <span className="font-semibold text-2xl ms-4 uppercase">
            Post Management
          </span>
        </div>
        <div className="flex items-center">
          <div className="me-3 font-medium">Order by</div>
          <select
            onChange={(e) => {
              setPageNo(1);
              setFilter(e.target.value);
            }}
            className="dropdown py-2 px-4"
          >
            <option value="all">All</option>
            <option value="Reported">Reported</option>
            <option value="Deleted">Deleted</option>
            <option value="Removed">Removed</option>
          </select>
        </div>
      </div>
      <div className="border-line"></div>
      <div className="px-10">
        <table className="mt-6 w-full">
          <thead className="table-head">
            <tr className="head grid-cols-10">
              <th>Post ID</th>
              <th>Author</th>
              <th>Image</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Likes</th>
              <th>Bookshelf</th>
              <th>Comments</th>
              <th>Report Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          {data.length > 0 ? (
            data.map((p, index) => (
              <tbody key={index}>
                <tr className="grid-cols-10 border h-12 text-center">
                  <td className="max-w-32">{p._id}</td>
                  <td className="flex justify-center items-center">
                    {p.user.userName}
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <div className="w-10 h-10 flex  justify-center items-center">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                          }
                        >
                          <ImageComponent
                            className="rounded-full"
                            src={p.imageUrls[0].secure_url}
                          ></ImageComponent>
                        </React.Suspense>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-44 ">
                    <div className="text-center flex justify-center w-full">
                      <div
                        style={{ scrollbarWidth: "none" }}
                        className="text-nowrap w-full overflow-x-auto "
                      >
                        {p.description}
                      </div>
                    </div>
                  </td>
                  <td>{p.createdAt}</td>
                  <td>{p.updatedAt}</td>
                  <td>{p.likes.length}</td>
                  <td>
                    {p.isAddedToBookshelf ? (
                      <FontAwesomeIcon
                        className="text-2xl text-green-400"
                        icon={faCheck}
                      />
                    ) : (
                      <FontAwesomeIcon
                        className="text-2xl text-red-400"
                        icon={faXmark}
                      />
                    )}
                  </td>
                  <td>{p.comments.length}</td>
                  <td>
                    {p.reports.length}
                    {p.reports.length > 0 && (
                      <button
                        onClick={() => viewReports(p._id)}
                        className="ms-2 text-xs bg-[#512da8] py-1 px-2 rounded-lg text-[#ffffff]"
                      >
                        View Reports
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="text-xl text-red-400 gap-4  flex justify-center items-center">
                      <FontAwesomeIcon icon={faBan} />
                      <FontAwesomeIcon
                        className="text-[#000000]"
                        icon={faEye}
                      />
                      <FontAwesomeIcon icon={faTrash} />
                    </div>
                  </td>
                </tr>
              </tbody>
            ))
          ) : (
            <tbody className="relative ">
              <tr className="absolute right-[50%] top-16">
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#512da8]"></div>
                ) : (
                  <td className="text-xl text-gray-400">No post found!</td>
                )}
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
