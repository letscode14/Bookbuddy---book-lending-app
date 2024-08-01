import Agenda, { Job } from 'agenda'
import IUserRepository from '../../usecases/interface/IUserRepository'

class JobScheduler {
  private agenda: Agenda
  private userRepository: IUserRepository

  constructor(agenda: Agenda, userRepository: IUserRepository) {
    this.agenda = agenda
    this.userRepository = userRepository
  }

  async start() {
    this.agenda.on('start', () => {
      console.log(`Job scheduler active`)
    })

    this.agenda.on('error', (error) => {
      console.error('Agenda encountered an error:', error)
    })

    this.agenda.define('removeStory', async (job: Job) => {
      const { userId, storyId } = job.attrs.data

      const story = await this.userRepository.removeStory(userId, storyId)
      if (story) {
        console.log(`Removed story`)
      } else {
        console.log(`story not found`)
      }
    })

    this.agenda.define('requestExpiry', async (job: Job) => {
      const { requestId } = job.attrs.data

      const story = await this.userRepository.makeRequestExpirey(requestId)
      if (story) {
        console.log(`made request expired`, requestId)
      } else {
        console.log(`error in scheduling job `)
      }
    })
    this.agenda.define('updateRemainingDays', async (job: Job) => {
      const { borrowId, lendedId } = job.attrs.data
      const result = await this.userRepository.updateRemainingDays(
        borrowId,
        lendedId
      )
    })
    // this.agenda.define('updateBadge', async () => {
    //   console.log('Running updateBadge job...')
    // })
  }
}
export default JobScheduler
