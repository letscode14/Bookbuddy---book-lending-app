import React from 'react'
import { useEffect, useRef, useState } from 'react'
import './Home.css'
import { useLocation } from 'react-router-dom'
import {
  UnLikePost,
  addComment,
  addReply,
  followUser,
  getPostForHome,
  getSuggestion,
  getUser,
  likePost,
  unfollowUser,
} from '../../../Service/Apiservice/UserApi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { saveUserDetails, selecUser } from '../../../store/slice/userAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPaperPlane,
  faEllipsis,
  faHeart as faheartSolid,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { faHeart, faComment } from '@fortawesome/free-regular-svg-icons'
import useEmblaCarousel from 'embla-carousel-react'
import ContentModal from '../../Modal/ContentModal'
import Report from '../Report/Report'

const ImageComponent = React.lazy(
  () => import('../../ImageComponent/PostImage')
)
export default function Home() {
  const { user } = useSelector(selecUser)
  const [emblaRef, emblaApi] = useEmblaCarousel()
  const [sLoading, setSloading] = useState(true)
  const [sBLoading, setSButtonLoading] = useState(true)
  const navigate = useNavigate()

  const contentPage = useRef(null)
  const { pathname } = useLocation()
  const [userData, setUser] = useState({})
  const [suggestions, setSuggestion] = useState([])
  const [followersId, setFollowersId] = useState([])
  const [followingId, setFollowingId] = useState([])
  const [post, setPost] = useState([])
  const [comment, setComment] = useState({})
  const [showAllComments, setCommentShow] = useState({})
  const [showReply, setShowReply] = useState({})
  const [reportBox, setReportBox] = useState({})
  const [reportDetails, setReporDetails] = useState({})
  const [reply, setReply] = useState({})

  const [isModalOpen, setModalOpen] = useState(false)

  const replyInput = useRef()

  const dispatch = useDispatch()
  const [followingStatus, setFollowingStatus] = useState({})

  useEffect(() => {
    const element = contentPage.current
    document.title = 'Home'

    element.style.right = '12px'
  }, [pathname])
  useEffect(() => {
    async function fetchUser() {
      const response = await getUser(user)
      console.log('hello')
      if (response) {
        setUser(response)
        dispatch(saveUserDetails(response))
        setFollowersId(response.followers.map((data) => data.userId))
        setFollowingId(response.following.map((data) => data.userId))
      }
    }
    fetchUser()

    async function fetchPost() {
      const response = await getPostForHome(user)
      if (response) {
        setPost(response)
        const initialShowComments = {}
        const initialReplyCommentsShow = {}
        const initialReportBox = {}
        response.forEach((post) => {
          initialShowComments[post._id] = false

          initialReportBox[post._id] = false

          post.comments.forEach((com) => {
            initialReplyCommentsShow[com._id] = false
          })
        })

        setCommentShow(initialShowComments)
        setShowReply(initialReplyCommentsShow)
        setReportBox(initialReportBox)
      }
    }
    fetchPost()
  }, [setShowReply])
  useEffect(() => {
    async function fetchSuggestions() {
      const response = await getSuggestion(user)

      if (response) {
        setSuggestion(response)
        const initialFollowStatus = {}

        response.forEach((suggestion) => {
          initialFollowStatus[suggestion._id] = false
          if (followersId.includes(suggestion._id)) {
            initialFollowStatus[suggestion._id] = 'follows you'
          }
          if (followingId.includes(suggestion._id)) {
            initialFollowStatus[suggestion._id] = 'followed'
          }
        })
        setSloading(false)
        setFollowingStatus(initialFollowStatus)

        setSButtonLoading(false)
      }
    }

    fetchSuggestions()
  }, [followingId])

  const handleFollow = async (userId, target) => {
    try {
      const response = await followUser(userId, target)

      if (response) {
        if (followingStatus[target] == 'follows you') {
          setFollowingStatus((prevStatus) => ({
            ...prevStatus,
            [target]: 'followed',
          }))
        } else {
          setFollowingStatus((prevStatus) => ({
            ...prevStatus,
            [target]: true,
          }))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleUnFollow = async (userId, target) => {
    const response = await unfollowUser(userId, target)
    if (response) {
      if (followingStatus[target] == 'followed') {
        setFollowingStatus((prevStatus) => ({
          ...prevStatus,
          [target]: 'follows you',
        }))
      } else {
        setFollowingStatus((prevStatus) => ({
          ...prevStatus,
          [target]: false,
        }))
      }
    }
  }

  const handleLike = async (postId, userId) => {
    try {
      const response = await likePost(postId, userId)
      if (response) {
        const updatedPosts = post.map((doc) => {
          if (doc._id === postId) {
            doc.likes = [
              ...doc.likes,
              { _id: userId, userName: userData.userName },
            ]
          }
          return doc
        })

        setPost(updatedPosts)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleUnlike = async (postId, userId) => {
    try {
      const response = await UnLikePost(postId, userId)
      if (response) {
        const filteredPost = post.map((doc) => {
          if (doc._id == postId) {
            doc.likes = doc.likes.filter((like) => like._id !== userId)
          }
          return doc
        })

        setPost(filteredPost)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSendComment = async (postId, userId, commentText) => {
    try {
      const response = await addComment(postId, userId, commentText)

      if (response) {
        setComment((prev) => ({ ...prev, [postId]: '' }))
        const p = post.map((p) => {
          if (p._id == postId) {
            p.comments.unshift(response)
          }
          return p
        })
        setPost(p)
        setShowReply((prev) => ({ ...prev, [response._id]: false }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleReplyComment = async (reply) => {
    try {
      const response = await addReply(reply)

      if (response) {
        setPost((prev) => {
          return prev.map((posts) => {
            if (posts._id == reply.postId) {
              const updatedComments = posts.comments.map((comments) => {
                if (comments._id == reply.commentId) {
                  return {
                    ...comments,
                    replies: [...comments.replies, response],
                  }
                }
                return comments
              })
              return {
                ...posts,
                comments: updatedComments,
              }
            }
            return posts
          })
        })
        setReply({})
      }
    } catch (error) {
      console.log(error)
    }
  }
  const findFollowedByCurrentUser = (userData, suggestion) => {
    return suggestion.followers
      .filter((follower) =>
        userData.following.some(
          (follow) => follow.userId == follower.userId._id
        )
      )
      .map((follower) => follower.userId.userName)
  }

  const handleContentModalClose = () => {
    setModalOpen(false)
  }

  return (
    <div
      ref={contentPage}
      className="ps-20 pe-20  overflow-auto  home-content absolute top-3 bottom-3 flex   bg-[#ffffff]"
    >
      <ContentModal
        isContentModalOpen={isModalOpen}
        onContentClose={handleContentModalClose}
      >
        <Report reportData={reportDetails} onClose={handleContentModalClose} />
      </ContentModal>
      <div className="left-container-home object-fit  relative  ">
        <div className="story-segment bg-[#ffffff] z-20 pt-10 items-center ps-2 overflow-y-auto sticky top-0  flex">
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
        <div className="flex   justify-center">
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
                        <div className="rounded-full cursor-pointer flex items-center justify-center   overflow-hidden">
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
                        <div
                          onClick={() => {
                            if (post.userId._id == userData._id) {
                              navigate('/user/profile')
                            } else {
                              navigate(`/user/${post.userId._id}`)
                            }
                          }}
                          className="cursor-pointer font-semibold"
                        >
                          {post.userId.userName}
                        </div>
                        <div></div>
                      </div>
                    </div>
                    <div className="relative ">
                      <FontAwesomeIcon
                        className="text-2xl"
                        onClick={() =>
                          setReportBox((prev) => ({
                            ...prev,
                            [post._id]: !prev[post._id],
                          }))
                        }
                        icon={faEllipsis}
                      />
                      <div
                        className={`text-box ${
                          reportBox[post._id] &&
                          post.userId._id !== userData._id
                            ? 'w-20'
                            : 'w-0'
                        }  overflow-hidden flex justify-center items-center absolute bg-[#512da8]   left-3`}
                      >
                        <span
                          onClick={() => {
                            setReporDetails({
                              culprit: post.userId._id,
                              contentId: post._id,
                              userId: userData._id,
                              email: userData.email,
                              userName: userData.userName,
                              type: 'Post',
                            })
                            setModalOpen(true)
                          }}
                          className="  font-semibold uppercase text-xs    text-[#ffffff]"
                        >
                          Report
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border post-home flex justify-center items-center">
                    {/* <div className="embla  h-full" ref={emblaRef}>
                      <div className="embla__container h-full">
                        {post.imageUrls.map((image, index) => (
                          <div key={index} className="embla__slide ">
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
                    </div> */}

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
                      {post.likes.some((like) => {
                        if (like._id == userData._id) return true
                        else return false
                      }) ? (
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
                  <div className="font-semibold">
                    {post.likes.length > 1
                      ? `Liked by ${post.likes[0].userName}  and ${
                          post.likes.length - 1
                        } others`
                      : post.likes.length == 1
                        ? `Liked by ${post.likes[0]?.userName} `
                        : 'O Likes'}
                  </div>
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
                              }))
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
                          showAllComments[post._id] ? 'overflow-auto ' : ''
                        }`}
                      >
                        {showAllComments[post._id] ? (
                          post.comments.map((comment, index) => (
                            <div
                              key={index}
                              className="flex mt-2 relative justify-between items-center"
                            >
                              <div className="text-sm  w-full">
                                <div className="flex w-full center">
                                  <div>
                                    <div className="me-2 rounded-full w-6 h-6 flex items-center justify-center   overflow-hidden">
                                      <React.Suspense
                                        fallback={
                                          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                        }
                                      >
                                        <ImageComponent
                                          src={comment.author.profileUrl}
                                        />
                                      </React.Suspense>
                                    </div>
                                  </div>
                                  <div>
                                    <span>{comment.author.userName}</span>
                                    <span className="ms-2 font-medium">
                                      {comment.content}
                                    </span>
                                  </div>
                                </div>
                                <div className="cursor-pointer  mt-2 text-gray-400 text-xs">
                                  <span
                                    onClick={() => {
                                      setComment((prev) => ({
                                        ...prev,
                                        [post._id]: '',
                                      }))
                                      setReply(() => ({
                                        userName: comment.author.userName,
                                        userId: userData._id,
                                        commentId: comment._id,
                                        placeHolder: `Reply to ${comment.author.userName} `,
                                        content: '',
                                        postId: post._id,
                                      }))
                                    }}
                                  >
                                    Reply
                                  </span>
                                  {comment.replies.length ? (
                                    showReply[comment._id] ? (
                                      <span
                                        className="ms-2"
                                        onClick={() =>
                                          setShowReply((prev) => ({
                                            ...prev,
                                            [comment._id]: false,
                                          }))
                                        }
                                      >
                                        Hide Reply
                                      </span>
                                    ) : (
                                      <span
                                        className="ms-2"
                                        onClick={() =>
                                          setShowReply((prev) => ({
                                            ...prev,
                                            [comment._id]: true,
                                          }))
                                        }
                                      >
                                        View Reply
                                      </span>
                                    )
                                  ) : (
                                    <span className="ms-2">0 Replies</span>
                                  )}
                                </div>
                                {showReply[comment._id] && (
                                  <div className="py-2">
                                    {comment.replies.map((rep, index) => {
                                      return (
                                        <div
                                          key={index}
                                          className="flex mb-2  ps-16 relative justify-between items-center w-full"
                                        >
                                          <div className="flex items-top">
                                            <div className="w-6 h-6 me-2">
                                              <span className="me-2 rounded-full w-6 h-6 flex items-center justify-center   overflow-hidden">
                                                <React.Suspense
                                                  fallback={
                                                    <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                                  }
                                                >
                                                  <ImageComponent
                                                    src={rep.author.profileUrl}
                                                  />
                                                </React.Suspense>
                                              </span>
                                            </div>
                                            <div className="pe-4">
                                              <span>{rep.author.userName}</span>
                                              <span className="ms-2 font-medium">
                                                {rep.content}
                                              </span>
                                            </div>
                                          </div>
                                          <FontAwesomeIcon
                                            className="text-xs absolute right-0 top-1"
                                            icon={faHeart}
                                          />
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>

                              <FontAwesomeIcon
                                className="text-xs absolute top-1 right-0 "
                                icon={faHeart}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="flex mt-1 relative justify-between w-full">
                            <div className="text-sm w-full">
                              <div className="flex  items-center">
                                <div>
                                  <span className="me-2 mt-1 rounded-full w-6 h-6 flex items-center justify-center   overflow-hidden">
                                    <React.Suspense
                                      fallback={
                                        <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                      }
                                    >
                                      <ImageComponent
                                        src={post.comments[0].author.profileUrl}
                                      />
                                    </React.Suspense>
                                  </span>
                                </div>
                                <div>
                                  <span>
                                    {post.comments[0].author.userName}
                                  </span>
                                  <span className="ms-2  font-medium">
                                    {post.comments[0].content}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2   cursor-pointer text-gray-400 text-xs">
                                <span
                                  onClick={() => {
                                    setComment((prev) => ({
                                      ...prev,
                                      [post._id]: '',
                                    }))
                                    setReply(() => ({
                                      userName:
                                        post.comments[0].author.userName,
                                      userId: userData._id,
                                      commentId: post.comments[0]._id,
                                      placeHolder: `Reply to ${post.comments[0].author.userName}`,
                                      content: '',
                                      postId: post._id,
                                    }))
                                  }}
                                >
                                  Reply
                                </span>
                                {post.comments[0].replies.length ? (
                                  showReply[post.comments[0]._id] ? (
                                    <span
                                      className="ms-2"
                                      onClick={() =>
                                        setShowReply((prev) => ({
                                          ...prev,
                                          [post.comments[0]._id]: false,
                                        }))
                                      }
                                    >
                                      Hide Reply
                                    </span>
                                  ) : (
                                    <span
                                      className="ms-2"
                                      onClick={() =>
                                        setShowReply((prev) => ({
                                          ...prev,
                                          [post.comments[0]._id]: true,
                                        }))
                                      }
                                    >
                                      View Reply
                                    </span>
                                  )
                                ) : (
                                  <span className="ms-2">0 Replies</span>
                                )}
                              </div>
                              {showReply[post.comments[0]._id] && (
                                <>
                                  {post.comments[0].replies.map(
                                    (rep, index) => {
                                      return (
                                        <div
                                          key={index}
                                          className="flex mt-1 mb-1 relative ps-16 justify-between items-center w-full"
                                        >
                                          <div className="flex items-top ">
                                            <div className="w-6 h-6 me-2 mt-1">
                                              <div className="me-2 rounded-full  w-6 h-6 flex items-center justify-center   overflow-hidden">
                                                <React.Suspense
                                                  fallback={
                                                    <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                                  }
                                                >
                                                  <ImageComponent
                                                    src={rep.author.profileUrl}
                                                  />
                                                </React.Suspense>
                                              </div>
                                            </div>

                                            <div>
                                              <span>{rep.author.userName}</span>
                                              <span className="ms-2 font-medium">
                                                {rep.content}
                                              </span>
                                            </div>
                                          </div>
                                          <FontAwesomeIcon
                                            className="text-xs absolute right-0 top-1"
                                            icon={faHeart}
                                          />
                                        </div>
                                      )
                                    }
                                  )}
                                </>
                              )}
                            </div>

                            <FontAwesomeIcon
                              className="text-xs absolute top-2 right-0 "
                              icon={faHeart}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="relative pe-9">
                    {Object.entries(reply).length > 0 &&
                    post._id == reply.postId ? (
                      <>
                        <input
                          ref={replyInput}
                          onFocus={() =>
                            setReply((prev) => ({
                              ...prev,
                              content: '',
                              placeHolder: '',
                            }))
                          }
                          onChange={(e) => {
                            setReply((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }}
                          value={
                            reply.content ? reply.content : reply.placeHolder
                          }
                          className={`add-comment relative  ${
                            reply.content ? '' : 'text-gray-400'
                          } text-sm   w-full mb-2`}
                          placeholder="add reply"
                        />

                        <FontAwesomeIcon
                          onClick={() => setReply({})}
                          className="top-1 right-1 text-lg  absolute text-lg text-red-400"
                          icon={faXmark}
                        />
                      </>
                    ) : (
                      <input
                        value={comment[post._id] || ''}
                        onChange={(e) => {
                          setComment((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }))
                        }}
                        className="text-sm add-comment  w-full mb-2"
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
                        className="absolute me-3 text-lg top-1 text-[#512da8] right-0"
                        icon={faPaperPlane}
                      />
                    )}
                    {reply?.content?.trim() && reply.postId == post._id && (
                      <FontAwesomeIcon
                        onClick={() => {
                          handleReplyComment(reply)
                        }}
                        className="absolute me-3 text-lg top-1 text-[#512da8] right-4"
                        icon={faPaperPlane}
                      />
                    )}
                  </div>
                  <div className="border my-2"></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="pt-28 sticky top-0 right-container-home ">
        <div className="ms-6">
          <div className="text-xl font-[600] mb-6">Suggestions for you</div>
          {sLoading ? (
            <div className=" flex ">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
              <span className="ms-2 text-gray-500">loading... </span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((u, index) => (
              <div
                key={index}
                className="one-suggestion mt-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="rounded-full flex items-center justify-center w-10 overflow-hidden">
                    <React.Suspense
                      fallback={
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#512da8]"></div>
                      }
                    >
                      <ImageComponent src={u.profileUrl} />
                    </React.Suspense>
                  </div>
                  <div className="ms-3">
                    <div className="font-semibold">{u.userName}</div>
                    <div className="text-gray-600 text-xs">
                      {findFollowedByCurrentUser(userData, u).length > 0 ? (
                        findFollowedByCurrentUser(userData, u).map(
                          (username) => (
                            <div key={username}>Followed by {username}</div>
                          )
                        )
                      ) : (
                        <div>Suggestions for you.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {sBLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
                  ) : (followingStatus[u._id] &&
                      Object.keys(followingStatus).length > 0 &&
                      followingStatus[u._id] !== 'follows you') ||
                    followingStatus[u._id] === 'followed' ? (
                    <button
                      className="unfollow-small-button"
                      onClick={() => handleUnFollow(user, u._id)}
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      className="follow-small-button"
                      onClick={() => handleFollow(user, u._id)}
                    >
                      {followingStatus[u._id] === 'follows you'
                        ? 'Follow back'
                        : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400">No suggestions!</div>
          )}
        </div>
      </div>
    </div>
  )
}
