import React, { useEffect, useState } from "react";
import {
  blockUser,
  getAllusers,
} from "../../../../Service/Apiservice/AdminApi";
import "./User.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEye,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";

import { showAdminToast } from "../../../../utils/toast";
const ImageComponent = React.lazy(() =>
  import("../../../ImageComponent/Image")
);
import { useConfirmationModal } from "../../../Modal/ModalContext";

export default function User() {
  const [data, setData] = useState([]);

  //state  for modal

  const [filterState, setFilter] = useState("all");
  const [pageNo, setPageNo] = useState(1);
  const [totalPage, setTotal] = useState(1);
  const { showModal } = useConfirmationModal();

  useEffect(() => {
    document.title = "User management";

    async function fetchUser() {
      const response = await getAllusers({ fetch: filterState, page: pageNo });
      if (response) {
        console.log(response);
        setData(response.user);
        setTotal(response.totalPage);
      }
    }
    fetchUser();
  }, [pageNo, filterState]);

  const proceedBlockUser = async (id, action) => {
    try {
      const response = await blockUser({ userId: id, action: action });
      if (response) {
        showAdminToast(response);
        const updatedData = data.map((user) => {
          if (user._id === id) {
            user.isBlocked = action === "Block" ? true : false;
          }
          return user;
        });
        setData(updatedData);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleBlockUser = (id, action) => {
    showModal(
      `Are you sure you want to ${action.toLowerCase()} this user?`,
      "admin",
      () => proceedBlockUser(id, action)
    );
  };
  return (
    <>
      <div className="bg-[#ffffff] max-h-[800px] h-[800px] relative   rounded-2xl mt-4 m">
        <div className="absolute text-xl right-10 bottom-10 flex justify-center items-center gap-2">
          <FontAwesomeIcon
            icon={faChevronLeft}
            onClick={() => {
              if (pageNo > 1) {
                setPageNo(pageNo - 1);
              }
            }}
          />
          <div className="border bg-[#51557E] text-[#ffffff] text-sm px-3 py-1 rounded-lg  px-2">
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
        <div className=" h-20 flex gap-9 items-center">
          <div>
            <span className="font-semibold text-2xl ms-4">USER MANAGEMENT</span>
          </div>

          <div className="flex items-center">
            <div className="me-3 font-medium">Order by</div>
            <select
              onChange={(e) => setFilter(e.target.value)}
              className="grid grap-y-2 dropdown py-2 px-4 "
            >
              <option value="all">All</option>
              <option value="Blocked">Blocked</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>
        </div>
        <div className="border-line"></div>
        <div className="W px-10">
          <table className="mt-6   w-full">
            <thead className=" table-head">
              <tr className="head  grid-cols-10">
                <th>Name</th>
                <th>Profile</th>

                <th>Email</th>
                <th>Usename</th>
                <th>Subscribed</th>
                <th>Lend Score</th>
                <th>Privacy</th>
                <th>ReportCount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            {data?.length > 0 ? (
              data.map((userItem, index) => (
                <tbody key={index} className="relative p-3">
                  <tr className="grid-cols-10 border h-12   text-center ">
                    <td>{userItem.name}</td>
                    <td className="flex justify-center items-center">
                      <div className="w-10 flex justify-center items-center ">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                          }
                        >
                          <ImageComponent
                            className="rounded-full"
                            src={userItem.profileUrl}
                          ></ImageComponent>
                        </React.Suspense>
                      </div>
                    </td>
                    <td>{userItem.email}</td>
                    <td>{userItem.userName}</td>
                    <td>{userItem.isSubscribed ? "Premium" : "Regular"}</td>
                    <td>{userItem.badge == "No badge" ? "0" : ""}</td>
                    <td>{userItem.privacy ? "Private" : "Public"}</td>
                    <td>{userItem.reportCount}</td>
                    <td>{userItem.isBlocked ? "Blocked" : "Active"}</td>
                    <td>
                      <div className="text-xl ">
                        <FontAwesomeIcon className="me-5" icon={faEye} />
                        {userItem.isBlocked ? (
                          <FontAwesomeIcon
                            onClick={() =>
                              handleBlockUser(userItem._id, "Unblock")
                            }
                            className="text-red-400"
                            icon={faLock}
                          />
                        ) : (
                          <FontAwesomeIcon
                            onClick={() =>
                              handleBlockUser(userItem._id, "Block")
                            }
                            className=""
                            icon={faLockOpen}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              ))
            ) : (
              <tbody className="relative ">
                <tr className="absolute right-[50%] top-16">
                  <td className="text-xl text-gray-400">No user found!</td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
