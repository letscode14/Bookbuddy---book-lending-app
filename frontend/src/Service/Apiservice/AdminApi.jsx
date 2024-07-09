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

export const getReports = async (targetId) => {
  try {
    updateAuthorizationHeader('admin')

    const response = await axiosInstance.get('/admin/post/reports', {
      params: { targetId: targetId },
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

export const addBadge = async (data) => {
  try {
    updateAuthorizationHeader('admin')
    const response = await axiosInstance.post('/admin/create-badge', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.status == 200) return true
    else return response.data.result
  } catch (error) {
    console.log(error)
    return error.response
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
