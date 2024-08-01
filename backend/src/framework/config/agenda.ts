import Agenda from 'agenda'
const agenda = new Agenda({
  db: {
    address: process.env.AGENDA_URI as string,
    collection: 'agendaJobs',
  },
})

export default agenda
