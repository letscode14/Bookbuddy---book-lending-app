import { createContext, useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import { selecUser } from '../store/slice/userAuth'
import { getStories } from '../Service/Apiservice/UserApi'

const StoryContext = createContext()

export const useStoryContext = () => useContext(StoryContext)

export const StoryProvider = ({ children }) => {
  const [stories, setStories] = useState([])
  const [storyPageNo, setPageNo] = useState(1)
  const { user } = useSelector(selecUser)
  const [storyLoading, setStoryLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [currentViewStory, setCurrentViewStory] = useState('')
  const [currentIndex, setCurrentIndex] = useState()

  const fetchStory = async () => {
    try {
      const response = await getStories(user, storyPageNo)
      console.log(response)
      if (response) {
        setStories((prev) => {
          const newStory = response.stories

          const updatedPosts = [
            ...prev,
            ...newStory.filter(
              (newStory) =>
                !prev.some((oldStory) => oldStory?._id === newStory?._id)
            ),
          ]

          return updatedPosts
        })
        setHasMore(response.hasMore)
      }
    } finally {
      setStoryLoading(false)
    }
  }
  const setCurrentView = (index) => {
    setCurrentViewStory(stories[index])
    setCurrentIndex(index)
  }

  const updateCurrentStories = (newStory, id) => {
    setStories((prev) => {
      return prev.map((s) => {
        if (s._id === id) {
          return {
            ...s,
            stories: newStory,
          }
        }

        return s
      })
    })
  }

  return (
    <StoryContext.Provider
      value={{
        storyLoading,
        setPageNo,
        fetchStory,
        storyPageNo,
        hasMore,
        stories,
        setCurrentView,
        currentViewStory,
        currentIndex,
        setCurrentIndex,
        setStories,
        updateCurrentStories,
      }}
    >
      {children}
    </StoryContext.Provider>
  )
}
