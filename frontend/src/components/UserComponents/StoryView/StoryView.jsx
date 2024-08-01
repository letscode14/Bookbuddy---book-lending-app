import React, { useEffect, useState, useCallback } from 'react'
import { useStoryContext } from '../../../Context/StoryContext'
import useEmblaCarousel from 'embla-carousel-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { makeStoryAsRead } from '../../../Service/Apiservice/UserApi'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../store/slice/userAuth'
const ImageComponent = React.lazy(
  () => import('../../ImageComponent/PostImage')
)

export default function StoryView() {
  const [emblaRef, emblaApi] = useEmblaCarousel()

  const {
    setCurrentView,
    currentViewStory,
    updateCurrentStories,
    stories,
    currentIndex,
  } = useStoryContext()

  const { user } = useSelector(selecUser)

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev()
    }
  })

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      } else {
        handleProfileChange()
      }
    }
  })

  const makeStoryAsViewed = async (storyId) => {
    const response = await makeStoryAsRead(storyId, user)

    if (response) {
      const updatedStories = currentViewStory.stories.map((story) => {
        if (story._id === storyId) {
          story.views[user] = true
          const updatedViews = {
            ...story.views,
            [user]: true,
          }
          const updatedStory = {
            ...story,
            views: updatedViews,
          }
          return updatedStory
        }
        return story
      })

      updateCurrentStories(updatedStories, currentViewStory._id)
    }
  }

  const handleProfileChange = () => {
    const nextProfileIndex = currentIndex + 1
    if (nextProfileIndex < stories.length) {
      setCurrentView(nextProfileIndex)
    } else {
      setCurrentView(1)
    }
  }
  useEffect(() => {
    if (currentViewStory && currentViewStory.stories.length > 0) {
      const firstStoryId = currentViewStory.stories[0]._id
      makeStoryAsViewed(firstStoryId)
    }
  }, [currentViewStory])

  useEffect(() => {
    const onSelect = () => {
      if (emblaApi) {
        const selectedIndex = emblaApi.selectedScrollSnap()
        const selectedStory = currentViewStory.stories[selectedIndex]
        if (selectedStory) {
          makeStoryAsViewed(selectedStory._id)
        }
      }
    }
    if (emblaApi) {
      emblaApi.on('select', onSelect)
    }

    return () => {
      if (emblaApi) {
        emblaApi.off('select', onSelect)
      }
    }
  }, [emblaApi, currentViewStory])
  return (
    <div className="w-[400px] h-[550px] rounded-lg xs:w-full xs:h-full">
      <div className="relative w-full ">
        <div className="absolute  w-full flex  z-10 px-5 py-2">
          <div className="rounded-full   w-10  overflow-hidden  ">
            <React.Suspense
              fallback={
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
              }
            >
              <ImageComponent
                src={currentViewStory.userId.profile.profileUrl}
              />
            </React.Suspense>
          </div>
          <div className="ms-2 text-sm text-[#ffffff] font-semibold">
            {currentViewStory.userId.userName}
          </div>
        </div>
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container   h-full ">
            {currentViewStory?.stories.length > 0 &&
              currentViewStory?.stories.map((s, i) => (
                <div
                  key={i}
                  className="embla__slide  flex justify-center w-full h-full"
                >
                  <React.Suspense
                    fallback={
                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                    }
                  >
                    <ImageComponent src={s?.imageUrl?.secure_url} />
                  </React.Suspense>
                </div>
              ))}
          </div>
        </div>
        {true && (
          <div className="absolute opacity-25 hover:opacity-100   top-[45%] px-1 w-full flex justify-between ">
            <FontAwesomeIcon
              onClick={scrollPrev}
              className="p-2 bg-gray-200  rounded-xl"
              icon={faChevronLeft}
            />
            <FontAwesomeIcon
              onClick={scrollNext}
              className="p-2 bg-gray-200   rounded-xl"
              icon={faChevronRight}
            />
          </div>
        )}
      </div>
    </div>
  )
}
