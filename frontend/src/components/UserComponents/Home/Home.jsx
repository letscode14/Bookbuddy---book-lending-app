import React from "react";
import { useEffect, useRef, useState } from "react";
import "./Home.css";
import { useLocation } from "react-router-dom";
import {
  UnLikePost,
  addComment,
  followUser,
  getPostForHome,
  getSuggestion,
  getUser,
  likePost,
  unfollowUser,
} from "../../../Service/Apiservice/UserApi";
import { useDispatch, useSelector } from "react-redux";
import { saveUserDetails, selecUser } from "../../../store/slice/userAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faEllipsis,
  faHeart as faheartSolid,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faComment } from "@fortawesome/free-regular-svg-icons";

const ImageComponent = React.lazy(() =>
  import("../../ImageComponent/PostImage")
);
export default function Home() {
  const { user } = useSelector(selecUser);

  const contentPage = useRef(null);
  const { pathname } = useLocation();
  const [userData, setUser] = useState({});
  const [sugggestions, setSuggestion] = useState([]);
  const [followersId, setFollowersId] = useState([]);
  const [post, setPost] = useState([]);
  const [comment, setComment] = useState({});
  const [showAllComments, setCommentShow] = useState({});
  const [reply, setReply] = useState({});
  const replyInput = useRef();

  const dispatch = useDispatch();
  const [followingStatus, setFollowingStatus] = useState({});
  useEffect(() => {
    const element = contentPage.current;
    document.title = "Home";

    element.style.right = "12px";
  }, [pathname]);
  useEffect(() => {
    async function fetchUser() {
      const response = await getUser(user);
      if (response) {
        setUser(response);
        dispatch(saveUserDetails(response));
        setFollowersId(response.followers.map((data) => data.userId));
      }
    }
    fetchUser();
  }, [user, dispatch]);

  useEffect(() => {
    async function fetchSuggestions() {
      const response = await getSuggestion(user);
      if (response) {
        setSuggestion(response);

        const initialFollowStatus = {};

        response.forEach((suggestion) => {
          initialFollowStatus[suggestion._id] = false;
          if (followersId.includes(suggestion._id)) {
            initialFollowStatus[suggestion._id] = "follows you";
          }
        });

        setFollowingStatus(initialFollowStatus);
      }
    }

    fetchSuggestions();
    async function fetchPost() {
      const response = await getPostForHome(user);
      if (response) {
        setPost(response);
        const initialShowComments = {};
        response.forEach((post) => (initialShowComments[post._id] = false));
        setCommentShow(initialShowComments);
      }
    }
    fetchPost();
  }, [followersId, user]);
  const handleFollow = async (userId, target) => {
    try {
      const response = await followUser(userId, target);

      if (response) {
        if (followingStatus[target] == "follows you") {
          setFollowingStatus((prevStatus) => ({
            ...prevStatus,
            [target]: "followed",
          }));
        } else {
          setFollowingStatus((prevStatus) => ({
            ...prevStatus,
            [target]: true,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnFollow = async (userId, target) => {
    const response = await unfollowUser(userId, target);
    if (response) {
      if (followingStatus[target] == "followed") {
        setFollowingStatus((prevStatus) => ({
          ...prevStatus,
          [target]: "follows you",
        }));
      } else {
        setFollowingStatus((prevStatus) => ({
          ...prevStatus,
          [target]: false,
        }));
      }
    }
  };

  const handleLike = async (postId, userId) => {
    try {
      const response = await likePost(postId, userId);
      if (response) {
        const updatedPosts = post.map((doc) => {
          if (doc._id === postId) {
            doc.likes = [...doc.likes, userId];
          }
          return doc;
        });

        setPost(updatedPosts);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnlike = async (postId, userId) => {
    try {
      const response = await UnLikePost(postId, userId);
      if (response) {
        const filteredPost = post.map((doc) => {
          if (doc._id == postId) {
            doc.likes = doc.likes.filter((like) => like !== userId);
          }
          return doc;
        });

        setPost(filteredPost);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendComment = async (postId, userId, commentText) => {
    try {
      const response = await addComment(postId, userId, commentText);

      if (response) {
        console.log(response);
        setComment((prev) => ({ ...prev, [postId]: "" }));
        const p = post.map((p) => {
          if (p._id == postId) {
            p.comments.unshift(response);
          }
          return p;
        });
        setPost(p);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReplyComment = async (reply) => {
    try {
    } catch (error) {
      console.log(error);
    }
  };
  const findFollowedByCurrentUser = (userData, suggestion) => {
    return suggestion.followers
      .filter((follower) =>
        userData.following.some(
          (follow) => follow.userId == follower.userId._id
        )
      )
      .map((follower) => follower.userId.userName);
  };
  return (
    <div
      ref={contentPage}
      className="ps-20 pe-20  overflow-auto  home-content absolute top-3 bottom-3 flex   bg-[#ffffff]"
    >
      <div className="left-container-home object-fit  relative  ">
        <div className="story-segment bg-[#ffffff] z-50 pt-10 items-center ps-2 overflow-y-auto sticky top-0  flex">
          <div className="own-profile relative flex justify-center">
            <FontAwesomeIcon
              className="text-2xl  absolute right-2 bottom-1"
              icon={faPlus}
            />
            <div className="rounded-full flex items-center justify-center   overflow-hidden">
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <ImageComponent src={userData.profileUrl} />
              </React.Suspense>
            </div>
          </div>
          <div className="own-profile ms-4 flex justify-center">
            <div className="rounded-full flex items-center justify-center   overflow-hidden">
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <ImageComponent src={userData.profileUrl} />
              </React.Suspense>
            </div>
          </div>

          <div className="others-story"> </div>
        </div>
        <div className="flex  justify-center">
          <div className="post-container mt-3  ">
            {post.map((post, index) => {
              return (
                <div key={index} className="one-post relative">
                  <div className="text-red-500 top-[34%] left-[50%] hidden absolute  animate-heartbeat">
                    <FontAwesomeIcon icon={faheartSolid} />
                  </div>
                  <div className="posted-user-details py-2 px-2 flex justify-between items-center">
                    <div className="flex ">
                      <div className="post-profile flex justify-center">
                        <div className="rounded-full flex items-center justify-center   overflow-hidden">
                          <React.Suspense
                            fallback={
                              <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                            }
                          >
                            <ImageComponent src={post.userId.profileUrl} />
                          </React.Suspense>
                        </div>
                      </div>
                      <div className="ms-4 ">
                        <div className=" font-semibold">
                          {post.userId.userName}
                        </div>
                        <div></div>
                      </div>
                    </div>
                    <div>
                      <FontAwesomeIcon className="text-2xl" icon={faEllipsis} />
                    </div>
                  </div>

                  <div className="border post-home flex justify-center items-center">
                    <React.Suspense
                      fallback={
                        <div className="animate-spin rounded-full h-20 w-20  border-t-2 border-b-2 border-[#512da8]"></div>
                      }
                    >
                      <ImageComponent src={post.imageUrls[0].secure_url} />
                    </React.Suspense>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl mt-1">
                      {post.likes.includes(userData._id) ? (
                        <FontAwesomeIcon
                          className="me-4 text-red-400"
                          onClick={() => handleUnlike(post._id, userData._id)}
                          icon={faheartSolid}
                        />
                      ) : (
                        <FontAwesomeIcon
                          className="me-4"
                          onClick={() => handleLike(post._id, userData._id)}
                          icon={faHeart}
                        />
                      )}

                      <FontAwesomeIcon icon={faComment} />
                    </div>
                    {post.isAddedToBookShelf && (
                      <div className="font-semibold text-[#512da8] mt-3 ">
                        Get the book
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">{post.likes.length} Likes</div>
                  <div className="font-semibold mt-2 ">
                    <div className="my-1">{post.userId.userName}</div>

                    <div className="my-2  text-ellipsis">
                      {post.description}
                    </div>
                  </div>
                  <div className="text-gray-500 mt-2 cursor-pointer">
                    ...more
                  </div>
                  {post.comments.length == 0 ? (
                    <div className="mt-1 text-gray-500">No comments yet</div>
                  ) : (
                    <>
                      <div className="mt-1 text-gray-500">
                        {showAllComments[post._id] ? (
                          <span
                            className="cursor-pointer"
                            onClick={() => {
                              setCommentShow((prev) => ({
                                ...prev,
                                [post._id]: false,
                              }));
                            }}
                          >
                            Hide comments
                          </span>
                        ) : (
                          post.comments.length > 1 && (
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                setCommentShow((prev) => ({
                                  ...prev,
                                  [post._id]: true,
                                }))
                              }
                            >
                              View all {post.comments.length} comments
                            </span>
                          )
                        )}
                      </div>
                      <div
                        className={`font-semibold fit-content mb-2 max-h-60 comments-overflow ${
                          showAllComments[post._id] ? "overflow-auto " : ""
                        }`}
                      >
                        {showAllComments[post._id] ? (
                          post.comments.map((comment, index) => (
                            <div
                              key={index}
                              className="flex mt-1  justify-between items-center"
                            >
                              <div className="text-sm mb-1">
                                <div>
                                  <span>{comment.author.userName}</span>
                                  <span className="ms-2 font-medium">
                                    {comment.content}
                                  </span>
                                </div>
                                <div
                                  onClick={() => {
                                    setComment((prev) => ({
                                      ...prev,
                                      [post._id]: "",
                                    }));
                                    setReply(() => ({
                                      userName: comment.author.userName,
                                      userId: userData._id,
                                      commentId: comment._id,
                                      placeHolder: `Reply to ${comment.author.userName} `,
                                      content: "",
                                      postId: post._id,
                                    }));
                                  }}
                                  className="cursor-pointer text-gray-400 text-xs"
                                >
                                  Reply
                                </div>
                              </div>
                              <div>
                                <FontAwesomeIcon
                                  className="text-xs"
                                  icon={faHeart}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex mt-1 justify-between items-center">
                            <div className="text-sm ">
                              <div>
                                <span>{post.comments[0].author.userName}</span>
                                <span className="ms-2 font-medium">
                                  {post.comments[0].content}
                                </span>
                              </div>
                              <div
                                onClick={() => {
                                  setComment((prev) => ({
                                    ...prev,
                                    [post._id]: "",
                                  }));
                                  setReply(() => ({
                                    userName: post.comments[0].author.userName,
                                    userId: userData._id,
                                    commentId: post.comments[0]._id,
                                    placeHolder: `Reply to ${post.comments[0].author.userName}`,
                                    content: "",
                                    postId: post._id,
                                  }));
                                }}
                                className="cursor-pointer text-gray-400 text-xs"
                              >
                                Reply
                              </div>
                            </div>
                            <div>
                              <FontAwesomeIcon
                                className="text-xs"
                                icon={faHeart}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="relative">
                    {Object.entries(reply).length > 0 &&
                    post._id == reply.postId ? (
                      <>
                        <input
                          ref={replyInput}
                          onFocus={() =>
                            setReply((prev) => ({
                              ...prev,
                              content: "",
                              placeHolder: "",
                            }))
                          }
                          onChange={(e) => {
                            setReply((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }));
                          }}
                          value={
                            reply.content ? reply.content : reply.placeHolder
                          }
                          className={`add-comment relative ${
                            reply.content ? "" : "text-gray-400"
                          } text-sm  my-2 w-full mt-2`}
                          placeholder="add reply"
                        />
                        <FontAwesomeIcon
                          onClick={() => setReply({})}
                          className="top-3 right-1 text-lg  absolute text-lg text-red-400"
                          icon={faXmark}
                        />
                      </>
                    ) : (
                      <input
                        value={comment[post._id] || ""}
                        onChange={(e) => {
                          setComment((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }));
                        }}
                        className="text-sm add-comment my-2 w-full mt-2"
                        placeholder="add comment"
                      />
                    )}

                    {comment[post._id]?.trim() && (
                      <FontAwesomeIcon
                        onClick={() =>
                          handleSendComment(
                            post._id,
                            userData._id,
                            comment[post._id].trim()
                          )
                        }
                        className="absolute me-3 text-lg top-3 text-[#512da8] right-0"
                        icon={faPaperPlane}
                      />
                    )}
                    {reply?.content?.trim() && (
                      <FontAwesomeIcon
                        onClick={() => {
                          handleReplyComment(reply);
                        }}
                        className="absolute me-3 text-lg top-3 text-[#512da8] right-4"
                        icon={faPaperPlane}
                      />
                    )}
                  </div>
                  <div className="border my-2"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="pt-28 sticky top-0 right-container-home ">
        <div className="ms-6">
          <div className="text-xl font-[600] mb-6">Suggestions for you</div>
          {sugggestions.length > 0 ? (
            sugggestions.map((u, index) => {
              return (
                <div
                  key={index}
                  className="one-suggestion mt-4 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div className="rounded-full flex items-center justify-center w-10   overflow-hidden">
                      <React.Suspense
                        fallback={
                          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                        }
                      >
                        <ImageComponent src={u.profileUrl} />
                      </React.Suspense>
                    </div>
                    <div className="ms-3">
                      <div className="font-semibold">{u.userName}</div>
                      <div className="text-gray-600 text-xs">
                        {findFollowedByCurrentUser(userData, u).map(
                          (username) => (
                            <div key={username}>Followed by {username}</div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  {(followingStatus[u._id] &&
                    followingStatus[u._id] !== "follows you") ||
                  followingStatus[u._id] == "followed" ? (
                    <button
                      className="unfollow-small-button"
                      onClick={() => handleUnFollow(user, u._id)}
                    >
                      UnFollow
                    </button>
                  ) : (
                    <button
                      className="follow-small-button"
                      onClick={() => handleFollow(user, u._id)}
                    >
                      {followingStatus[u._id] == "follows you"
                        ? "follow back  "
                        : "Follow"}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-gray-400">No suggestions !</div>
          )}
        </div>
      </div>
    </div>
  );
}
