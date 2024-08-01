import createServer from './framework/config/app'
import { connecDB } from './framework/config/connectDB'
import { initSocketsever } from './framework/services/socketService'
import agenda from './framework/config/agenda'
import UserRepository from './framework/repository/userRepository'
import { Worker } from 'worker_threads'
import path from 'path'

import http from 'http'
import { config } from 'dotenv'
config()

const startWorker = () => {
  const worker = new Worker(
    path.resolve(__dirname, 'framework/services/Worker.ts'),
    {
      execArgv: ['-r', 'ts-node/register'],
    }
  )

  worker.on('message', (message) => {
    if (message.status === 'complete') {
      console.log('User loading complete')
    } else if (message.status === 'error') {
      console.error('Error loading users:', message.error)
    }
  })

  worker.on('error', (error) => {
    console.error('Worker error:', error)
  })

  worker.postMessage({ action: 'loadUsers' })
}

const startServer = async () => {
  try {
    await connecDB()
    const app = createServer()
    const server = http.createServer(app)

    const port = process.env.PORT

    initSocketsever(server)

    await agenda.start()
    await agenda.every('5 seconds', 'updateBadge')

    server?.listen(port, () => {
      console.log('server is running at port ', port)
    })

    startWorker()
  } catch (error) {
    console.log(error)
  }
}

startServer()
