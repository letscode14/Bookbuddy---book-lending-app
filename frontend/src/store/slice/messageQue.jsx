import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  messageQue: null,
}

const messageQue = createSlice({
  name: 'msg',
  initialState,
  reducers: {
    saveUnReadMesg: (state, action) => {
      state.messageQue = action.payload
    },
    makeMessageUnread: (state, action) => {
      state.messageQue = action.payload
    },
    updateMessageRead: (state, action) => {
      const { id, content, newCount } = action.payload

      if (!state.messageQue) {
        state.messageQue = {}
      }

      if (!state.messageQue[id]) {
        state.messageQue[id] = { mCount: 0 }
      }

      state.messageQue = {
        ...state.messageQue,
        [id]: {
          content: content,
          mCount:
            newCount == 0
              ? state.messageQue[id].mCount - state.messageQue[id].mCount
              : state.messageQue[id].mCount + 1,
        },
      }
    },
  },
})

export const { saveUnReadMesg, makeMessageUnread, updateMessageRead } =
  messageQue.actions

export const selectMsgMap = (state) => state.msg

export default messageQue.reducer
