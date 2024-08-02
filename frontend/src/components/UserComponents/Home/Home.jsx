import React, { useCallback, useContext } from 'react'
import { useEffect, useRef, useState } from 'react'
import './Home.css'
import { useLocation } from 'react-router-dom'
import {
  UnLikePost,
  addComment,
  addReply,
  getPostForHome,
  getUser,
  giveBookRequest,
  likePost,
  sendMessage,
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
  faCircleCheck,
  faBell,
  faMessage,
} from '@fortawesome/free-solid-svg-icons'
import { faHeart } from '@fortawesome/free-regular-svg-icons'
import useEmblaCarousel from 'embla-carousel-react'
import ContentModal from '../../Modal/ContentModal'
import Report from '../Report/Report'
import Subscribe from '../Subscribe/Subscribe'
import { SocketContext } from '../../../Socket/SocketContext'
import { useNotificaitonContext } from '../../../Context/NotificationContext'
import { showErrorToast, showSuccessToast } from '../../../utils/toast'
import { useConfirmationModal } from '../../Modal/ModalContext'
import AddStory from '../AddStory/AddStory'
import { useStoryContext } from '../../../Context/StoryContext'
import StoryView from '../StoryView/StoryView'
import Suggestions from '../Suggestions/Suggestions'
import { ResponsiveSuggestion } from '../Suggestions/Suggestions'
import ReponsiveNav from '../Navbar/ReponsiveNav'
import Logo from '/images/Logo2.png'
import { getShuffledIndexes } from '../../../../helpers/ValidationHelpers/helper.js'
import Intro from '../Intro/Intro.jsx'
import PostSlide from './PostSlide.jsx'

const ImageComponent = React.lazy(
  () => import('../../ImageComponent/PostImage')
)
export default function Home() {
  const [post, setPost] = useState([])
  const {
    commentResonse,
    setCommentResponse,
    latestLike,
    setLikes,
    unReadMsgNum,
  } = useNotificaitonContext()

  const socket = useContext(SocketContext)
  const { user } = useSelector(selecUser)

  //story context
  const { stories, fetchStory, storyPageNo, setCurrentView } = useStoryContext()
  const { showModal } = useConfirmationModal()

  const navigate = useNavigate()
  //for pagination
  const [hasMore, setHasMore] = useState(true)
  const [pageNo, setPageNo] = useState(1)

  const [postLoading, setPostLoading] = useState(true)

  const contentPage = useRef(null)
  const { pathname } = useLocation()
  const [userData, setUser] = useState({})

  const [comment, setComment] = useState({})
  const [showAllComments, setCommentShow] = useState({})
  const [showReply, setShowReply] = useState({})
  const [reportBox, setReportBox] = useState({})
  const [reportDetails, setReporDetails] = useState({})
  const [reply, setReply] = useState({})
  const [mLoading, setMloagin] = useState(false)
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalfor, setModalFor] = useState('')

  const replyInput = useRef()

  const dispatch = useDispatch()

  useEffect(() => {
    const newUser = localStorage.getItem('newUser') === 'true'

    if (newUser) {
      setModalOpen(true)
      setModalFor('intro')
      localStorage.removeItem('newUser')
    }
  }, [])

  useEffect(() => {
    fetchStory()
  }, [storyPageNo, isModalOpen])

  useEffect(() => {
    if (commentResonse) {
      const p = post.map((p) => {
        if (p._id == commentResonse.postId) {
          p.comments.unshift(commentResonse.response)
        }
        return p
      })
      setPost(p)

      setShowReply((prev) => ({
        ...prev,
        [commentResonse.response._id]: false,
      }))
      setCommentResponse('')
    }
  }, [commentResonse])

  useEffect(() => {
    const element = contentPage.current
    document.title = 'Home'
  }, [pathname])

  useEffect(() => {
    async function fetchUser() {
      const response = await getUser(user)
      if (response) {
        setUser(response.user)
        dispatch(
          saveUserDetails({
            _id: response.user._id,
            email: response.user.email,
            isSubscribed: response.user.isSubscribed,
            isGoogleSignUp: response.user.isGoogleSignUp,
            privacy: response.user.privacy,
            profileUrl: response.user.profile.profileUrl,
            name: response.user.name,
            userName: response.user.userName,
            followersMap: response.followersMap,
            followingMap: response.followingMap,
          })
        )
      }
    }
    fetchUser()

    async function fetchPost() {
      const response = await getPostForHome(user, pageNo)
      if (response) {
        setHasMore(response.hasMore)
        setPost((prev) => {
          const newPosts = response.post

          const updatedPosts = [
            ...prev,
            ...newPosts.filter(
              (newPost) => !prev.some((oldPost) => oldPost._id === newPost._id)
            ),
          ]

          return updatedPosts
        })

        const initialShowComments = {}
        const initialReplyCommentsShow = {}
        const initialReportBox = {}
        response.post.forEach((post) => {
          initialShowComments[post._id] = false

          initialReportBox[post._id] = false

          post.comments.forEach((com) => {
            initialReplyCommentsShow[com._id] = false
          })
        })

        setCommentShow(initialShowComments)
        setShowReply(initialReplyCommentsShow)
        setReportBox(initialReportBox)
        setPostLoading(false)
      } else {
        setPostLoading(false)
      }
    }
    fetchPost()
  }, [pageNo])

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
        const { notification } = response
        if (Object.keys(notification).length > 0) {
          socket.emit('liked post', { notification })
        }

        setPost(updatedPosts)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (latestLike !== '') {
      const updatedPosts = post.map((doc) => {
        if (doc._id === latestLike.postId) {
          doc.likes = [
            ...doc.likes,
            {
              _id: latestLike.actionBy._id,
              userName: latestLike.actionBy.userName,
            },
          ]
        }
        return doc
      })
      setPost(updatedPosts)
      setLikes('')
    }
  }, [latestLike])

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
        socket.emit('unlike post', { postId, userId })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSendComment = async (
    postId,
    userId,
    commentText,
    postOwnerId
  ) => {
    try {
      setMloagin(true)
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
        socket.emit('new comment', { response, postOwnerId, postId })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setMloagin(false)
    }
  }

  const handleReplyComment = async (reply, postOwnerId) => {
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
        socket.emit('new comment', {
          response,
          postOwnerId,
          reply: reply.authorId,
          replyDetails: reply,
        })
      }
      setReply({})
    } catch (error) {
      console.log(error)
    }
  }

  // const findFollowedByCurrentUser = (userData, suggestion) => {
  //   return suggestion.followers
  //     .filter((follower) =>
  //       userData.following.some(
  //         (follow) => follow.userId == follower.userId._id
  //       )
  //     )
  //     .map((follower) => follower.userId.userName)
  // }

  const handleContentModalClose = () => {
    setModalOpen(false)
  }

  const handleScroll = () => {
    if (!contentPage.current) return

    const { scrollTop, scrollHeight, clientHeight } = contentPage.current

    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (hasMore && !postLoading) {
        setPageNo((prevPageNo) => prevPageNo + 1)
        setPostLoading(true)
      }
    }
  }
  const handleGetTheBook = async (userId, bookId, ownerId) => {
    try {
      const response = await giveBookRequest(userId, bookId, ownerId)

      if (response?.status !== true) {
        if (
          response.status == 403 &&
          response.data.message == 'Not subscribed'
        ) {
          setModalFor('subscribe')
          setModalOpen(true)
        } else {
          showErrorToast(response.data.result.message)
        }
      } else {
        const obj = {
          senderId: userId,
          chatId: response.response.data.result?.requestedUser.chatId,
          content: response.response.data.result?.requestedUser.requestId,
          isRequestForBook: true,
        }
        const messageResponse = await sendMessage(obj)

        if (messageResponse) {
          showSuccessToast(
            'Request is successfully send to the user wait till the user accepts'
          )
          if (!messageResponse.isNewChat)
            socket.emit('new message', messageResponse.message)
          else {
            const newreciever =
              messageResponse.message.chatId.participants.find((p) => p != user)
            socket.emit('newchatwithuser', newreciever)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
  const [i1, setI1] = useState()
  const [i2, setI2] = useState()

  useEffect(() => {
    if (post.length > 0) {
      const [index2, index3] = getShuffledIndexes(post.length)
      console.log(index2, index3)
      setI1(index2)
      setI2(index3)
    }
  }, [post])

  return (
    <>
      <ReponsiveNav />
      <div
        onScroll={handleScroll}
        ref={contentPage}
        className="rounded-[40px]  right-[12px] ps-20 pe-20   overflow-auto    home-content absolute top-3 bottom-3 flex   bg-[#ffffff] 
         xs:left-0 xs:right-0 xs:rounded-[0px] xs:top-0 xs:bottom-0 xs:ps-1 xs:pe-1 
         sm:left-20
         sm:ps-7 sm:pe-7
         md:left-[240px]
         
         lg:ps-20 lg:pe-20  lg:left-[280px]
        "
      >
        <ContentModal
          isContentModalOpen={isModalOpen}
          onContentClose={handleContentModalClose}
        >
          {modalfor == 'report' && (
            <Report
              reportData={reportDetails}
              onClose={handleContentModalClose}
            />
          )}
          {modalfor == 'subscribe' && <Subscribe user={userData._id} />}
          {modalfor == 'story' && (
            <AddStory close={handleContentModalClose} user={userData._id} />
          )}

          {modalfor == 'storyView' && <StoryView />}
          {modalfor == 'intro' && <Intro onClose={handleContentModalClose} />}
        </ContentModal>

        <div
          className=" xs:w-full relative     
          min-w-[72%]
         xs:min-w-0 
         
         2xl:w-[60%]
         xs:w-full
         sm:w-full
         "
        >
          <div className="bg-[#ffffff] py-1 hidden xs:flex xs:justify-between xs:items-center fixed top-0 left-0 right-0 z-50">
            <img className="ms-2 w-32 h-full" src={Logo} alt="" />
            <div className="me-3 xs:mt-2 xs:ml-2 flex">
              <div className="relative">
                {unReadMsgNum ? (
                  <div className="z-20 absolute right-3 top-[-10px]  bg-red-500 text-[#ffffff] flex items-center justify-center rounded-full w-5 h-5 text-xs">
                    {unReadMsgNum}
                  </div>
                ) : (
                  ''
                )}
                <FontAwesomeIcon
                  onClick={() => navigate('/user/notification')}
                  className="text-[#512da8] text-2xl me-5"
                  icon={faBell}
                />
              </div>

              <FontAwesomeIcon
                onClick={() => navigate('/user/messages')}
                className="text-[#512da8] text-2xl"
                icon={faMessage}
              />
            </div>
          </div>
          <div
            className=" bg-[#ffffff] z-20 pt-10  items-center ps-2  
            sticky top-0  flex 
            xs:pt-2 xs:ps-1  xs:pt-[62px] 
            gap-2"
          >
            {Object.keys(userData).length > 0 && (
              <div
                className=" 
                w-[120px]     
                relative flex justify-center 
              xs:w-[90px] 
              sm:w-[100px]
              lg:w-[120px]"
              >
                <FontAwesomeIcon
                  onClick={() => {
                    setModalFor('story')
                    setModalOpen(true)
                  }}
                  className="text-md  rounded-full 
                   absolute right-2 bottom-1 font-bold 
                   bg-[#512da8] text-[#ffffff] p-1
              xs:text-xs xs:bottom-0 xs:right-1 "
                  icon={faPlus}
                />
                <div
                  className={`${
                    stories[0]?.stories?.length > 0
                      ? stories[0]?.stories?.every((story) =>
                          story.views[user] ? true : false
                        )
                        ? 'bg-gray-400 p-1'
                        : 'bg-[#512da8] p-1'
                      : 'bg-[#ffffff]'
                  } rounded-full`}
                >
                  <div
                    className={`rounded-full ${stories[0]?.stories?.length > 0 && 'p-1'} bg-[#ffffff]`}
                  >
                    <div
                      onClick={() => {
                        if (stories[0]?.stories.length > 0) {
                          setCurrentView(0)
                          setModalFor('storyView')
                          setModalOpen(true)
                        }
                      }}
                      className="rounded-full flex items-center justify-center   overflow-hidden"
                    >
                      <React.Suspense
                        fallback={
                          <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                        }
                      >
                        <ImageComponent src={userData.profile?.profileUrl} />
                      </React.Suspense>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stories.length > 1 &&
              stories.map(
                (s, i) =>
                  s?.userId?._id !== user &&
                  s !== null && (
                    <div
                      className=" 
                       
                        w-[120px]     
                        relative flex  
                      xs:w-[90px] 
                      sm:w-[100px]
                      lg:w-[120px] 
                      
                      "
                      key={i}
                    >
                      <div className="  flex justify-center ">
                        <div
                          className={`${s?.stories?.every((story) => (story?.views[user] ? true : false)) ? ' bg-gray-400 p-1' : 'bg-[#512da8] p-1'} rounded-full`}
                        >
                          <div className={`p-1 bg-[#ffffff] rounded-full`}>
                            <div
                              onClick={() => {
                                if (s?.stories.length > 0) {
                                  setCurrentView(i)
                                  setModalFor('storyView')
                                  setModalOpen(true)
                                }
                              }}
                              className="rounded-full flex items-center justify-center   overflow-hidden"
                            >
                              <React.Suspense
                                fallback={
                                  <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                                }
                              >
                                <ImageComponent
                                  src={s?.userId.profile.profileUrl}
                                />
                              </React.Suspense>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
          </div>

          <div className="flex xs:px-1  justify-center">
            <div
              className="w-[43%]   mt-5
           xs:w-full
           sm:w-[70%]
           lg:w-[45%]
           "
            >
              {post.length > 0
                ? post.map((post, index) => {
                    return (
                      <div key={index} className="relative">
                        {i1 && i1 == index && <ResponsiveSuggestion />}
                        {i2 && i2 == index && <ResponsiveSuggestion />}
                        <div className="text-red-500 top-[34%] left-[50%] hidden absolute  animate-heartbeat">
                          <FontAwesomeIcon icon={faheartSolid} />
                        </div>
                        <div
                          className="posted-user-details py-2 px-2 flex justify-between items-center
                         xs:px-0"
                        >
                          <div className="flex ">
                            <div
                              className="w-[50px] h-[50px]  flex justify-center 
                        xs:w-[40px] xs:h-[40px] "
                            >
                              <div className="relative">
                                <div className="rounded-full cursor-pointer flex items-center justify-center   overflow-hidden">
                                  <React.Suspense
                                    fallback={
                                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                    }
                                  >
                                    <ImageComponent
                                      src={post.userId.profile?.profileUrl}
                                    />
                                  </React.Suspense>
                                </div>
                                {post.userId.isSubscribed && (
                                  <FontAwesomeIcon
                                    className="text-sm  text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-0 xs:text-xs"
                                    icon={faCircleCheck}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="ms-4 xs:ms-2 xs:text-sm">
                              <div
                                onClick={() => {
                                  if (post.userId._id == userData._id) {
                                    navigate('/user/profile')
                                  } else {
                                    navigate(`/user/other/${post.userId._id}`)
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
                              className="text-2xl xs:text-lg"
                              onClick={() =>
                                setReportBox((prev) => ({
                                  ...prev,
                                  [post._id]: !prev[post._id],
                                }))
                              }
                              icon={faEllipsis}
                            />
                            <div
                              className={`rounded-tl-lg rounded-b-lg h-8 z-30 transition-all duration-200 ${
                                reportBox[post._id] &&
                                post.userId._id !== userData._id
                                  ? 'w-20'
                                  : 'w-0'
                              }  overflow-hidden flex justify-center items-center absolute right-2 transform origin-right bg-[#512da8]`}
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
                                  setModalFor('report')
                                }}
                                className="cursor-pointer  font-semibold uppercase text-xs    text-[#ffffff]"
                              >
                                Report
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border post-home flex justify-center items-center">
                          <PostSlide imageUrls={post.imageUrls} />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-2xl mt-1">
                            {post.likes.some((like) => {
                              if (like._id == userData._id) return true
                              else return false
                            }) ? (
                              <FontAwesomeIcon
                                className="me-4  text-red-400 "
                                onClick={() =>
                                  handleUnlike(post._id, userData._id)
                                }
                                icon={faheartSolid}
                              />
                            ) : (
                              <FontAwesomeIcon
                                className="me-4 "
                                onClick={() =>
                                  handleLike(post._id, userData._id)
                                }
                                icon={faHeart}
                              />
                            )}
                          </div>
                          {post.isAddedToBookShelf &&
                            post.userId._id !== userData._id && (
                              <div
                                onClick={() => {
                                  showModal(
                                    'You will be initiating a trasaction with this user .Do you wish to continue',
                                    'user',
                                    () =>
                                      handleGetTheBook(
                                        userData._id,
                                        post.isAddedToBookShelf,
                                        post.userId._id
                                      )
                                  )
                                }}
                                className="cursor-pointer font-semibold text-[#512da8] mt-3 xs:text-sm"
                              >
                                Get the book
                              </div>
                            )}
                        </div>
                        <div className="font-semibold xs:text-sm">
                          {post.likes.length > 1
                            ? `Liked by ${post.likes[0].userName}  and ${
                                post.likes.length - 1
                              } others`
                            : post.likes.length == 1
                              ? `Liked by ${post.likes[0]?.userName} `
                              : 'O Likes'}
                        </div>
                        <div className="font-semibold mt-2 xs:text-sm">
                          <div className="my-1">{post.userId.userName}</div>

                          <div className="my-2  truncate xs:text-sm">
                            {post.description}
                          </div>
                        </div>
                        <div className=" text-gray-500 mt-2 cursor-pointer xs:text-xs">
                          ...more
                        </div>
                        {post.comments.length == 0 ? (
                          <div className="mt-1 text-gray-500 xs:text-sm">
                            No comments yet
                          </div>
                        ) : (
                          <>
                            <div className="mt-1 text-gray-500 xs:text-sm">
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
                              className={`font-semibold  fit-content mb-2 max-h-60 comments-overflow xs:text-sm ${
                                showAllComments[post._id]
                                  ? 'overflow-auto '
                                  : ''
                              }`}
                            >
                              {showAllComments[post._id] ? (
                                post.comments.map((comment, index) => (
                                  <div
                                    key={index}
                                    className="flex mt-2  relative justify-between items-center"
                                  >
                                    <div className="text-sm  w-full">
                                      <div className="flex w-full center">
                                        <div>
                                          <div className="relative">
                                            <div className="me-2 rounded-full w-7 h-7 flex items-center justify-center   overflow-hidden ">
                                              <React.Suspense
                                                fallback={
                                                  <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                                }
                                              >
                                                <ImageComponent
                                                  src={
                                                    comment.author.profile
                                                      .profileUrl
                                                  }
                                                />
                                              </React.Suspense>
                                            </div>
                                            {comment.author.isSubscribed && (
                                              <FontAwesomeIcon
                                                className="text-[10px] text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-2 "
                                                icon={faCircleCheck}
                                              />
                                            )}
                                          </div>
                                        </div>
                                        <div className="">
                                          <span>{comment.author.userName}</span>
                                          <span className="ms-2 font-medium">
                                            {comment.content}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="cursor-pointer  mt-2 text-gray-400 text-xs">
                                        <span
                                          className="xs:text-[11px]"
                                          onClick={() => {
                                            setComment((prev) => ({
                                              ...prev,
                                              [post._id]: '',
                                            }))
                                            setReply(() => ({
                                              userName: comment.author.userName,
                                              userId: userData._id,
                                              commentId: comment._id,
                                              authorId: comment.author._id,
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
                                              className="ms-2 xs:text-[11px]"
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
                                              className="ms-2 xs:text-[11px]"
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
                                          <span className="ms-2 xs:text-[11px]">
                                            0 Replies
                                          </span>
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
                                                    <div className="relative">
                                                      <div className="me-2 rounded-full w-7 h-7 flex items-center justify-center   overflow-hidden">
                                                        <React.Suspense
                                                          fallback={
                                                            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                                          }
                                                        >
                                                          <ImageComponent
                                                            src={
                                                              rep.author.profile
                                                                .profileUrl
                                                            }
                                                          />
                                                        </React.Suspense>
                                                      </div>
                                                      {rep.author
                                                        .isSubscribed && (
                                                        <FontAwesomeIcon
                                                          className="text-[10px] text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-[-5px]"
                                                          icon={faCircleCheck}
                                                        />
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="pe-4 xs:ms-1">
                                                    <span>
                                                      {rep.author.userName}
                                                    </span>
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
                                        <div className="relative">
                                          <div className="me-2 rounded-full w-7 h-7 flex items-center justify-center   overflow-hidden">
                                            <React.Suspense
                                              fallback={
                                                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                              }
                                            >
                                              <ImageComponent
                                                src={
                                                  post.comments[0].author
                                                    .profile.profileUrl
                                                }
                                              />
                                            </React.Suspense>
                                          </div>
                                          {post.comments[0].author
                                            .isSubscribed && (
                                            <FontAwesomeIcon
                                              className="text-[10px] text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-2 "
                                              icon={faCircleCheck}
                                            />
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <span>
                                          {post.comments[0].author.userName}
                                        </span>
                                        <span className="ms-2  font-medium ">
                                          {post.comments[0].content}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mt-2   cursor-pointer text-gray-400 text-xs">
                                      <span
                                        className="xs:text-[11px]"
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
                                            authorId:
                                              post.comments[0].author._id,
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
                                            className="ms-2 xs:text-[11px]"
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
                                        <span className="ms-2 xs:text-[11px]">
                                          0 Replies
                                        </span>
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
                                                    <div className="relative">
                                                      <div className="me-2 rounded-full w-7 h-7 flex items-center justify-center   overflow-hidden">
                                                        <React.Suspense
                                                          fallback={
                                                            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                                          }
                                                        >
                                                          <ImageComponent
                                                            src={
                                                              rep.author.profile
                                                                .profileUrl
                                                            }
                                                          />
                                                        </React.Suspense>
                                                      </div>
                                                      {rep.author
                                                        .isSubscribed && (
                                                        <FontAwesomeIcon
                                                          className="text-[10px] text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-[-5px]"
                                                          icon={faCircleCheck}
                                                        />
                                                      )}
                                                    </div>
                                                  </div>

                                                  <div>
                                                    <span>
                                                      {rep.author.userName}
                                                    </span>
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
                                  reply.content
                                    ? reply.content
                                    : reply.placeHolder
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

                          {comment[post._id]?.trim() && !mLoading && (
                            <FontAwesomeIcon
                              onClick={() =>
                                handleSendComment(
                                  post._id,
                                  userData._id,
                                  comment[post._id].trim(),
                                  post.userId._id
                                )
                              }
                              className="absolute me-3 text-lg top-1 text-[#512da8] right-0"
                              icon={faPaperPlane}
                            />
                          )}
                          {reply?.content?.trim() &&
                            reply.postId == post._id && (
                              <FontAwesomeIcon
                                onClick={() => {
                                  handleReplyComment(reply, post.userId._id)
                                }}
                                className="absolute me-3 text-lg top-1 text-[#512da8] right-4"
                                icon={faPaperPlane}
                              />
                            )}
                        </div>
                        <div className="border my-2"></div>
                      </div>
                    )
                  })
                : !postLoading && (
                    <div className="flex justify-center">
                      <div className="align-center p-4 border text-md h-full inline-block bg-[#ede9f7] shadow-lg rounded-lg">
                        No Feeds
                      </div>
                    </div>
                  )}
              {postLoading && (
                <div className="w-full  mt-3    flex justify-center">
                  <div className="animate-spin  rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Suggestions />
      </div>
    </>
  )
}
