import { useCallback, useState } from "react";
import React from "react";
import "./PostView.css";
import useEmblaCarousel from "embla-carousel-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEllipsis,
  faPaperPlane,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as SolidHeart } from "@fortawesome/free-solid-svg-icons";
import {
  UnLikePost,
  addComment,
  addReply,
  likePost,
} from "../../../../Service/Apiservice/UserApi";

const ImageComponent = React.lazy(() =>
  import("../../../ImageComponent/PostImage")
);

export default function PostView({ postData, user }) {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [comment, setComment] = useState({});
  const [reply, setReply] = useState({});

  const [post, setPost] = useState(postData);
  const [showReply, setShowReply] = useState(
    postData.comments.reduce((acc, com) => {
      acc[com._id] = false;
      return acc;
    }, {})
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  });
  const createdAt = new Date(post.createdAt).toDateString();

  const handleSendComment = async (postId, userId, content) => {
    try {
      const response = await addComment(postId, userId, content);
      if (response) {
        setComment((prev) => ({ ...prev, [postId]: "" }));

        post.comments.unshift(response);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleReplyComment = async (reply) => {
    try {
      const response = await addReply(reply);
      if (response) {
        const updatedComments = post.comments.map((comment) =>
          comment._id === reply.commentId
            ? { ...comment, replies: [...comment.replies, response] }
            : comment
        );
        const updatedPost = { ...post, comments: updatedComments };
        setPost(updatedPost);
        setReply({});
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleLike = async (postId, userId) => {
    try {
      const response = await likePost(postId, userId);
      if (response) {
        const updatedPost = {
          ...post,
          likes: [...post.likes, { _id: userId, userName: user.userName }],
        };
        setPost(updatedPost);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnlike = async (postId, userId) => {
    try {
      const response = await UnLikePost(postId, userId);
      if (response) {
        const filteredLikes = post.likes.filter((like) => like._id !== userId);
        setPost({ ...post, likes: filteredLikes });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="  flex w-[80vh] h-[55vh]">
      <div className="  relative w-[50%] ">
        <div className="embla h-full " ref={emblaRef}>
          <div className="embla__container   h-full">
            {post.imageUrls.map((image, index) => (
              <div key={index} className="embla__slide h-full">
                <React.Suspense
                  fallback={
                    <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                  }
                >
                  <ImageComponent src={image.secure_url} />
                </React.Suspense>
              </div>
            ))}
          </div>
        </div>
        {post.imageUrls.length > 1 && (
          <div className="absolute opacity-25 hover:opacity-100   top-[45%] px-1 w-full flex justify-between ">
            <FontAwesomeIcon
              onClick={scrollPrev}
              className="p-2 bg-gray-200  rounded-xl"
              icon={faChevronLeft}
            />
            <FontAwesomeIcon
              onClick={scrollNext}
              className="p-2 bg-gray-200   rounded-xl"
              icon={faChevronRight}
            />
          </div>
        )}
      </div>
      <div className=" p-3   w-[50%] right-view-post-container">
        <div className="flex justify-between ">
          <div className="flex ">
            <div className="w-9 ">
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <img
                  className="rounded-full object-contain"
                  src={user.profileUrl}
                />
              </React.Suspense>
            </div>
            <div className="ms-3">
              <span className="text-sm font-semibold">{user.userName}</span>
            </div>
          </div>
          <div>
            <FontAwesomeIcon className="me-6 text-md" icon={faEllipsis} />
          </div>
        </div>
        <div className="border mt-2"></div>
        <div
          style={{ scrollbarWidth: "none" }}
          className="pt-1 py-3 overflow-y-auto h-[330px]"
        >
          <>
            {post.comments.length ? (
              post.comments.map((com, index) => (
                <div key={index}>
                  <div className="flex justify-between  mt-2">
                    <div className="flex items-top">
                      <div className="w-6 h-6 me-2">
                        <div className="w-6 h-6 me-2">
                          <React.Suspense
                            fallback={
                              <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                            }
                          >
                            <img
                              className="rounded-full object-contain"
                              src={user.profileUrl}
                            />
                          </React.Suspense>
                        </div>
                      </div>

                      <div className="pe-4">
                        <span className="font-semibold text-xs">
                          {com.author.userName}
                        </span>
                        <span className="text-sm ms-1">{com.content} </span>
                      </div>
                    </div>
                    <div>
                      <FontAwesomeIcon className="text-xs" icon={faHeart} />
                    </div>
                  </div>
                  <div className="text-[11px] flex gap-2 mt-1">
                    <div
                      className="text-gray-400 cursor-pointer  font-semibold"
                      onClick={() => {
                        setComment((prev) => ({ ...prev, [post._id]: "" }));
                        setReply({
                          userName: com.author.userName,
                          userId: user._id,
                          commentId: com._id,
                          placeholder: `Reply to ${com.author.userName}`,
                          content: "",
                          postId: post._id,
                        });
                      }}
                    >
                      reply
                    </div>
                    {com.replies.length ? (
                      showReply[com._id] ? (
                        <span
                          onClick={() =>
                            setShowReply((prev) => ({
                              ...prev,
                              [com._id]: false,
                            }))
                          }
                          className="text-gray-400 cursor-pointer  font-semibold"
                        >
                          hide reply
                        </span>
                      ) : (
                        <span
                          onClick={() =>
                            setShowReply((prev) => ({
                              ...prev,
                              [com._id]: true,
                            }))
                          }
                          className="text-gray-400 cursor-pointer  font-semibold"
                        >
                          view reply
                        </span>
                      )
                    ) : (
                      <span className="text-gray-400  font-semibold">
                        O replies
                      </span>
                    )}
                  </div>
                  {showReply[com._id] &&
                    com.replies.map((rep, index) => {
                      return (
                        <div
                          key={index}
                          className="flex justify-between ps-16  mt-2"
                        >
                          <div className="flex items-top">
                            <div className="w-6 h-6 me-2">
                              <div className="w-6 h-6 mt-1 me-2">
                                <React.Suspense
                                  fallback={
                                    <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                                  }
                                >
                                  <img
                                    className="rounded-full object-contain"
                                    src={rep.author.profileUrl}
                                  />
                                </React.Suspense>
                              </div>
                            </div>

                            <div className="pe-4">
                              <span className="font-semibold text-xs">
                                {rep.author.userName}
                              </span>
                              <span className="text-sm ms-1">
                                {rep.content}
                              </span>
                            </div>
                          </div>
                          <div>
                            <FontAwesomeIcon
                              className="text-xs"
                              icon={faHeart}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center">
                no comments yet
              </div>
            )}
          </>
        </div>
        <div className="border"></div>
        <div className="flex mt-1 mb-1 justify-between items-center">
          {post.likes.some((likes) => {
            if (likes._id == user._id) return true;
          }) ? (
            <FontAwesomeIcon
              className="me-4 text-xl text-red-400"
              onClick={() => handleUnlike(post._id, user._id)}
              icon={SolidHeart}
            />
          ) : (
            <FontAwesomeIcon
              className="me-4 text-xl"
              onClick={() => handleLike(post._id, user._id)}
              icon={faHeart}
            />
          )}
          <span className="text-sm text-[#512da8] font-bold">Get the book</span>
        </div>
        <div className="text-xs mt-1 font-semibold">
          {post.likes.length > 0 ? (
            <>
              Liked By {post.likes[0].userName}
              {post.likes.length > 1 && `and ${post.likes.length - 1} others`}
            </>
          ) : (
            <span>0 Likes</span>
          )}
        </div>
        <div className="text-xs text-gray-400">{createdAt}</div>
        <div className="border my-1"></div>
        <div className="text-sm flex justify-between items-center">
          {Object.entries(reply).length > 0 ? (
            <>
              <input
                onFocus={() =>
                  setReply((prev) => ({
                    ...prev,
                    content: "",
                    placeholder: "",
                  }))
                }
                onChange={(e) => {
                  setReply((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }));
                }}
                value={reply.content ? reply.content : reply.placeholder}
                className={`add-comment relative  ${
                  reply.content ? "" : "text-gray-400"
                } text-sm   w-full mb-2`}
                placeholder="add reply"
              />
              <div className="flex gap-2 items-center">
                {reply.content.trim() && (
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="text-[#512da8]"
                    onClick={() => handleReplyComment(reply)}
                  />
                )}

                <FontAwesomeIcon
                  onClick={() => setReply({})}
                  className=" text-lg   text-lg text-red-400"
                  icon={faXmark}
                />
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center w-full">
              <input
                value={comment[post._id] || ""}
                className="post-view-add-comment w-full"
                placeholder="add comment"
                onChange={(e) => {
                  setComment((prev) => ({
                    ...prev,
                    [post._id]: e.target.value,
                  }));
                }}
              />
              {comment[post._id]?.trim() && (
                <FontAwesomeIcon
                  onClick={() => {
                    handleSendComment(
                      post._id,
                      user._id,
                      comment[post._id].trim()
                    );
                  }}
                  className="text-[#512da8]"
                  icon={faPaperPlane}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
