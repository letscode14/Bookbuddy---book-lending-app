'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const agenda_1 = __importDefault(require('agenda'))
const agenda = new agenda_1.default({
  db: {
    address: process.env.AGENDA_URI,
    collection: 'agendaJobs',
  },
})
exports.default = agenda
