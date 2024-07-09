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
      return true
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
    console.log(response)
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
    console.log(response)
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
    const response = await axiosInstance.post('/user/report', reportData)
    if (response.status == 200) return true
    return false
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}

export const getBookshelf = async (userId) => {
  try {
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
    const response = await axiosInstance.patch('/user/shelf/remove', data)
    if (response.status == 200) return true
    else return false
  } catch (error) {
    console.log(error)
  }
}

export const giveBookRequest = async (userId, bookId, ownerId) => {
  try {
    const response = await axiosInstance.get('/user/request-book', {
      params: { userId, bookId, ownerId },
    })

    if (response.status === 200) {
      return true
    }
  } catch (error) {
    return error.response
  }
}
export const createOrder = async (amount, user) => {
  try {
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
