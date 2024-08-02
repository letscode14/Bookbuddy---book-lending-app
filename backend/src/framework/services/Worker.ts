import { parentPort } from 'worker_threads'
import { connecDB } from '../config/connectDB'
import userModel from '../databases/userModel'
import User from '../../entity/userEntity'
import { UserTrie } from '../repository/userTrie'
import UserRepository from '../repository/userRepository'
import { redis } from '../config/redis'

const userRepository = new UserRepository()

async function loadAllUsers() {
  try {
    await connecDB()
    console.log('Worker: Attempting to load users...')
    const cacheKey = 'blockedUsers'

    const blockedUsers = (await userModel
      .find({ isBlocked: true })
      .select('_id')
      .lean()) as User[]

    await redis.set(cacheKey, JSON.stringify(blockedUsers), 'EX', 86400)

    console.log('All blocked users are looaded')
    parentPort?.postMessage({ status: 'complete' })
  } catch (error) {
    console.error('Error loading blocked users:', error)
    if (parentPort) {
      parentPort.postMessage({ status: 'error', error })
    }
  }
}

async function updateBadge() {
  try {
    await connecDB()
    await userRepository.updateBadge()

    parentPort?.postMessage({ status: 'updatebadgecomplete' })
  } catch (error) {
    console.error('Error updating the badge:', error)
    if (parentPort) {
      parentPort.postMessage({ status: 'bagdeerror', error })
    }
  }
}

parentPort?.on('message', async (message) => {
  if (message.action === 'loadUsers') {
    await loadAllUsers()
  }
})
parentPort?.on('message', async (message) => {
  if (message.action == 'updateBadge') {
    await updateBadge()
  }
})
