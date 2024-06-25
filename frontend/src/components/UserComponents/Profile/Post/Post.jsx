import React from "react";
import "./Post.css";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selecUser } from "../../../../store/slice/userAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import { getPost } from "../../../../Service/Apiservice/UserApi";
const ImageComponent = React.lazy(() =>
  import("../../../ImageComponent/Image")
);

export default function Post() {
  const { user } = useSelector(selecUser);
  const [post, setPost] = useState();
  

  useEffect(() => {
    (async function fetchPost() {
      const response = await getPost(user);
      if (response) {
        setPost(response);
      }
    })();
  }, []);

  return (
    <>
      {post?.length > 0 ? (
        post.map((posts, index) => {
          return (
            <div
              key={index}
              className="post border flex justify-center items-center relative"
            >
              {posts.imageUrls?.length > 1 && (
                <FontAwesomeIcon
                  icon={faImages}
                  className="text-[#ffffff] absolute right-3 text-xl top-2"
                />
              )}
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <ImageComponent
                  src={posts.imageUrls[0].secure_url}
                ></ImageComponent>
              </React.Suspense>
            </div>
          );
        })
      ) : (
        <div className="text-gray-400 absolute mt-36 top-[50%] left-[30%] text-2xl  flex justify-center">
          No post yet!
        </div>
      )}
    </>
  );
}
