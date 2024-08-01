import axios from 'axios'
import axiosInstance from '../api'
import { updateAuthorizationHeader } from '../api'

export const adminLogin = async (adminDetails) => {
  try {
    const response = await axiosInstance.post('/admin/login', {
      adminDetails,
    })
    console.log(response)
    if (response.status == 200) {
      localStorage.setItem('adminAccessToken', response.data.accessToken)
      localStorage.setItem('adminRefreshToken', response.data.refreshToken)
      updateAuthorizationHeader('admin')
      return response
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getAllusers = async (query = { fetch: 'all' }) => {
  try {
    updateAuthorizationHeader('admin')
    const response = await axiosInstance.get('/admin/user/list/', {
      params: query,
    })
    if (response.status == 200) {
      return response.data
    }
    return false
  } catch (error) {
    console.log(error)
    false
  }
}

export const blockUser = async (query = { fetch: 'all' }) => {
  try {
    updateAuthorizationHeader('admin')
    const response = await axiosInstance.patch('/admin/user/block', query)

    if (response.status == 200) {
      return response.data.message
    }
  } catch (error) {
    console.log(error)
  }
}

export const getPost = async (query = { fetch: 'all' }) => {
  try {
    updateAuthorizationHeader('admin')
    const response = await axiosInstance.get('/admin/post', { params: query })
    if (response.status == 200) {
      return response.data
    }
    return false
  } catch (error) {
    console.log(error)
  }
}

export const getReports = async (targetId, pageNo) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/post/reports', {
      params: { targetId: targetId, pageNo: pageNo },
    })
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
  }
}

export const removeReports = async (rId) => {
  try {
    updateAuthorizationHeader('admin')
    const response = await axiosInstance.patch('/admin/remove/report', { rId })

    if (response.status == 200) return true
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}
//add badge
export const addBadge = async (data) => {
  try {
    updateAuthorizationHeader('admin')
    const response = await axiosInstance.post('/admin/create-badge', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.status == 200)
      return { status: true, badge: response.data.result }
    else return false
  } catch (error) {
    console.log(error)
    return error.response
  }
}
export const editBadge = async (data, badgeId, isChanged) => {
  try {
    updateAuthorizationHeader('admin')
    const response = await axiosInstance.patch('/admin/edit-badge', data, {
      params: { badgeId: badgeId, isChanged: isChanged },
    })
    if (response.status == 200)
      return { status: true, badge: response.data.result }
    else return false
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}

export const getBadge = async () => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/badge')
    if (response) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}
export const getSingleBadge = async (badgeId) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/single-badge', {
      params: { badgeId: badgeId },
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
export const getLended = async (pageNo, filter) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/get/lended', {
      params: { pageNo: pageNo, filter: filter },
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
export const getBorrowed = async (pageNo, filter) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/get/borrowed', {
      params: { pageNo: pageNo, filter: filter },
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

export const getSingleUser = async (userId) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/get/single-user', {
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

export const getReportedPost = async (userId, pageNo) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/get/user/reported-post', {
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

export const getUserStats = async () => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/get/user/statistics')
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}
export const getUserPeriodStats = async (filter) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get(
      '/admin/get/user/period/statistics',
      { params: { filter: filter } }
    )
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getHighLendScoreusers = async (pageNo) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/get/top/lendscore/users', {
      params: { pageNo: pageNo },
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

export const getPostStatistics = async () => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/get/post/statistics')
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getPostStatisticsPeriod = async (filter) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get(
      '/admin/get/post/period/statistics',
      { params: { filter: filter } }
    )
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getHighBoostedPosts = async () => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/get/post/boosted/post')
    if (response.status == 200) {
      return response.data.result
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getSinglePost = async (postId) => {
  updateAuthorizationHeader('admin')
  try {
    const response = await axiosInstance.get('/admin/get/post', {
      params: {
        postId: postId,
      },
    })
    if (response.status == 200) return response.data.result
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}
export const removePost = async (postId) => {
  updateAuthorizationHeader('admin')
  try {
    const response = await axiosInstance.patch('/admin/remove/post', {
      postId: postId,
    })

    if (response.status == 200) return true
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

//transaction statisitcs
export const getTStats = async () => {
  updateAuthorizationHeader('admin')

  try {
    const response = await axiosInstance.get('/admin/transaction/statistics')
    if (response.status == 200) return response.data.result
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getPTstats = async (filter) => {
  updateAuthorizationHeader('admin')

  try {
    const response = await axiosInstance.get(
      '/admin/period/transaction/statistics',
      { params: { filter: filter } }
    )
    if (response.status == 200) return response.data.result
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getRstats = async (filter) => {
  updateAuthorizationHeader('admin')

  try {
    const response = await axiosInstance.get(
      '/admin/period/request/statistics',
      { params: { filter: filter } }
    )
    if (response.status == 200) return response.data.result
    else return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export const makeRefundAmount = async (culpritId, beneficiaryId, lendId) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.post('/admin/make-refund', {
      culpritId: culpritId,
      beneficiaryId: beneficiaryId,
      lendId: lendId,
    })
    if (response.status == 200) {
      return { status: true, message: response.data.result }
    }
  } catch (error) {
    console.log(error)
    return error.response.data.message
  }
}
