import axios from 'axios'
import axiosInstance from '../api'
import { updateAuthorizationHeader } from '../api'

export const login = async (userDetails) => {
  try {
    const response = await axiosInstance.post('/user/login', userDetails)
    if (response.status == 200) {
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      updateAuthorizationHeader('user')
      return {
        status: true,
        accessToken: response.data.accessToken,
        user: response.data._id,
      }
    }
  } catch (error) {
    console.log(error)
    return { status: false, message: 'error in api call' }
  }
}

export const checkUserName = async (username) => {
  try {
    await axiosInstance.post('/user/check/user/name', {
      username: username,
    })
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export const registerUser = async (userDetails) => {
  try {
    const response = await axiosInstance.post('/user/registration', userDetails)

    if (response.status === 200) {
      return { status: true, token: response.data.activationToken }
    }
  } catch (error) {
    console.log(error)
    return { status: false }
  }
}

export const resendOtp = async () => {
  const response = await axiosInstance.get('/user/resendotp')
  if (response.status == 200)
    return {
      status: true,
      message: response.data.message,
      activationToken: response.data.activationToken,
    }
  else return false
}

export const submitOtp = async (url, data) => {
  try {
    const response = await axiosInstance.post(url, data)
    if (response.status == 200) {
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      updateAuthorizationHeader('user')
      return {
        status: true,
        user: response.data._id,
        token: response.data.accessToken,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const loginWithOtp = async (user) => {
  try {
    const response = await axiosInstance.post('/user/login-otp', user)
    if (response.status == 200) return response.data.accessToken
  } catch (error) {
    console.log(error)
    return false
  }
}

export const createPost = async (formData, id) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.post(
      `/user/create/post/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    if (response.status == 201)
      return { status: true, message: response.data.message }
    else {
      return false
    }
  } catch (error) {
    console.log(error)
  }
}

export const getPost = async (userId) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.get(`/user/post/${userId}`)
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUser = async (userId, currentUser) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.get(`/user/profile/${userId}`, {
      params: { currentUser },
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
  }
}

export const getSuggestion = async (userId) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.get('/user/suggestions', {
      params: { id: userId },
    })
    if (response.status == 200) {
      return response.data.users
    }
    return false
  } catch (error) {
    console.log(error)
  }
}

export const followUser = async (userId, targetId) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.post('/user/follow', {
      userId: userId,
      target: targetId,
    })

    if (response.status == 200) {
      return true
    } else return false
  } catch (error) {
    console.log(error)
  }
}

export const unfollowUser = async (userId, targetId) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.post('/user/unfollow', {
      userId: userId,
      target: targetId,
    })
    if (response.status == 200) {
      return true
    }
  } catch (error) {
    console.log(error)
  }
}

export const getPostForHome = async (userId, pageNo) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.get(`/user/post/content/${userId}`, {
      params: { pageNo },
    })
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
  }
}

export const likePost = async (postId, userId) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.patch(`/user/post/like`, {
      userId,
      postId,
    })

    if (response.status == 200) {
      return response.data.result
    } else return false
  } catch (error) {
    console.log(error)
  }
}

export const UnLikePost = async (postId, userId) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.patch(`/user/post/dislike`, {
      postId,
      userId,
    })
    if (response.status == 200) {
      return true
    } else return false
  } catch (error) {
    console.log(error)
  }
}

export const sendVerifyEmail = async (email, userId) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.post(
      `/user/edit/verify/email/${userId}`,
      { email }
    )
    if (response.status == 200) {
      return response.data
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const submitEmailVerifyOtp = async (code) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.post('/user/submit/verify/email/otp', {
      code,
    })

    if (response.status == 200) {
      return true
    }
  } catch (error) {
    console.log(error)

    return false
  }
}

export const editUserDetails = async (formData) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.post(`/user/edit/details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.status == 200) {
      return response.data.message
    }
  } catch (error) {
    console.log('axios', error)
    return false
  }
}

export const fetchPost = async (postId) => {
  updateAuthorizationHeader('user')
  try {
    const response = await axiosInstance.get('/user/get/post', {
      params: postId,
    })
    if (response.status == 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const addComment = async (postId, userId, comment) => {
  updateAuthorizationHeader('user')
  try {
    const response = await axiosInstance.patch('/user/add/comment', {
      postId,
      userId,
      comment,
    })
    if (response.status == 200) {
      return response.data.result
    }
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export const addReply = async (reply) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.patch('/user/add/reply', reply)

    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export const fetchF = async (query) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.get('/user/friends/users', {
      params: query,
    })
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
  }
}

export const postReport = async (reportData) => {
  updateAuthorizationHeader('user')
  try {
    const response = await axiosInstance.post('/user/report', reportData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.status == 200) return true
    return false
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}

export const getBookshelf = async (userId) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.get('/user/bookshelf', {
      params: { userId },
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
  }
}

export const viewOneBook = async (bookId, userId) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.get('/user/book', {
      params: { bookId, userId },
    })
    if (response.status == 200) return response.data.result
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const editBookshelf = async (data) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.patch('/user/edit/bookshelf', data)
    if (response.status == 200) {
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

export const removeFromShelf = async (data) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.patch('/user/shelf/remove', data)
    if (response.status == 200) return true
    else return false
  } catch (error) {
    console.log(error)
  }
}

export const giveBookRequest = async (userId, bookId, ownerId) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.get('/user/request-book', {
      params: { userId, bookId, ownerId },
    })

    if (response.status === 200) {
      return { status: true, response }
    }
  } catch (error) {
    console.log(error)
    return error.response
  }
}
export const createOrder = async (amount, user) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.post('/user/pay-subscription', {
      amount,
      id: user,
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const verifyPayment = async (orderId, paymentId, signature, userId) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.post('/user/payment-verification', {
      orderId,
      paymentId,
      signature,
      userId,
    })
    return response
  } catch (error) {
    console.log(error)

    return error.response
  }
}

export const getSingleChat = async (senderId, userID) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.post(
      `/user/chat/${senderId}/${userID}`
    )
    if (response.status == 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getAllChat = async (user, query) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.get(`/user/chats/${user}`, {
      params: { pageNo: query },
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
  }
}

export const sendMessage = async (data) => {
  updateAuthorizationHeader('user')

  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.post('/user/chat/message', data)
    if (response.status == 200) return response.data.result
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getAllMessages = async (chatId, pageNo) => {
  updateAuthorizationHeader('user')

  try {
    updateAuthorizationHeader('user')

    const data = {
      chatId,
      pageNo,
    }
    const response = await axiosInstance.get('/user/messages', { params: data })
    if (response.status == 200) return response.data.result
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const makeMesgRead = async (messageId) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.patch(
      `/user/messages/read/${messageId}`
    )
    if (response.status == 200) return true
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const declineRequest = async (
  senderId,
  requestId,
  messageId,
  chatId
) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.patch('/user/request/decline', {
      senderId,
      requestId,
      messageId,
      chatId,
    })
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const addStory = async (formData, userId) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.post(
      `/user/add-story/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (response.status == 201) {
      return response.data.result
    } else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getStories = async (userId, pageNo) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.get('/user/stories', {
      params: { userId, pageNo },
    })

    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const makeStoryAsRead = async (storyId, userId) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.patch('/user/make-story-read', {
      storyId,
      userId,
    })

    if (response.status == 200) {
      return true
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const acceptRequest = async (
  requestId,
  requestedUser,
  userId,
  messageId,
  chatId
) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.post('/user/request/accept', {
      requestId,
      userId,
      requestedUser,
      messageId,
      chatId,
    })

    if (response.status == 200) {
      return { status: true, message: response.data.result.message }
    }

    return false
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}

export const acceptCollect = async (
  requestId,
  requestedUser,
  userId,
  messageId,
  chatId
) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.patch('/user/collect-book', {
      requestId,
      userId,
      requestedUser,
      messageId,
      chatId,
    })
    console.log(response)
    if (response.status == 200) {
      return { status: true, message: response.data.result }
    }

    return false
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}

export const getLendedBooks = async (userId, pageNo) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.get('/user/lended/books', {
      params: { userId: userId, pageNo: pageNo },
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}
export const getBorrowedBooks = async (userId, pageNo) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.get('/user/borrowed/books', {
      params: { userId: userId, pageNo: pageNo },
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}
export const getNotification = async (userId, pageNo, unRead) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.get('/user/notifications', {
      params: {
        userId: userId,
        pageNo: pageNo,
        unRead: unRead,
      },
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const giveBookBack = async (userId, requestId, sendTo, borrowId) => {
  try {
    updateAuthorizationHeader('user')
    const response = await axiosInstance.patch('/user/give-book-back', {
      userId: userId,
      requestId: requestId,
      sendTo: sendTo,
      borrowId: borrowId,
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

//change pass before login

export const changePassEmailVerify = async (email) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.post(
      '/user/change-password/verify-email',
      { email }
    )
    if (response.status == 200) {
      return { status: true, token: response.data.activationToken }
    }
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}

export const resendOtpForChangepassbeforeLogin = async () => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.get(
      '/user/resend/otp/change/pass/before/login'
    )
    console.log('resend respones', response)
    if (response.status == 200) {
      return {
        status: true,
        message: response.data.message,
        token: response.data.activationToken,
      }
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}

export const submitOtpForChangePassBeforeLogin = async (otp) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.post(
      '/user/submit/change-pass/otp/before/login',
      { otp: otp }
    )
    if (response.status == 200) {
      return response.data.activationToken
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const submitNewPasswordBeforeLogin = async (password) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.post(
      '/user/submit/new-password/before/login',
      { password: password }
    )
    if (response.status == 200) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

///

export const getUsersCurrentLocation = async ({ lat, long }) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
    )
    return response.data.features[0]?.place_name || 'No address found'
  } catch (error) {
    console.log(error)
  }
}

export const getExploreBooks = async (userId) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.get('/user/explore/books', {
      params: { userId: userId },
    })
    if (response.status == 200) return response.data.result
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getOtPforChangePass = async (email, userId) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.get('/user/change/pass/after/otp', {
      params: {
        email: email,
        userId: userId,
      },
    })
    if (response.status == 200) {
      return response.data.result
    } else return false
  } catch (error) {
    console.log(error)
    return { status: false, message: error.response.data.message }
  }
}
export const resendOtPforChangePass = async (userId) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.get(
      '/user/change/pass/after/resend-otp',
      { params: { userId: userId } }
    )
    if (response.status == 200) {
      return response.data.activationToken
    } else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const submitOtpForChangePass = async (otp) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.post(
      '/user/change/pass/after/submit-otp',
      { otp: otp }
    )
    if (response.status == 200) {
      return { status: true, token: response.data.activationToken }
    }
  } catch (error) {
    console.log(error)
    return error.response.data.result
  }
}

export const submitOldPassword = async (password, userId) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.post(
      '/user/change/pass/submit-old-password',
      { password: password },
      { params: { userId: userId } }
    )
    if (response.status == 200) {
      return { status: true, token: response.data.activationToken }
    }
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}

export const submiNewPassword = async (password) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.post(
      '/user/change/pass/submit-new-password',
      { password: password }
    )
    if (response.status == 200) {
      return true
    }
  } catch (error) {
    return error.response.data.message
  }
}

export const searchUser = async (pageNo, query, user) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.get('/user/search', {
      params: {
        pageNo: pageNo,
        search: query,
        user: user,
      },
    })
    console.log(response)
    if (response.status == 200) {
      return response.data.result
    } else {
      false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getDeposit = async (userId) => {
  updateAuthorizationHeader('user')

  try {
    const response = await axiosInstance.get('/user/get-deposit', {
      params: { userId: userId },
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}
export const createAddFundsOrder = async (userId, email) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.post('/user/add-funds', {
      userId,
      email,
    })
    if (response.status == 200) {
      return response.data.result
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const verifyAddfundsPayment = async (
  orderId,
  paymentId,
  signature,
  userId,
  amount
) => {
  try {
    updateAuthorizationHeader('user')

    const response = await axiosInstance.post(
      '/user/verify-add-funds-payment',
      {
        orderId,
        paymentId,
        signature,
        userId,
        amount,
      }
    )
    return response
  } catch (error) {
    console.log(error)

    return error.response
  }
}
