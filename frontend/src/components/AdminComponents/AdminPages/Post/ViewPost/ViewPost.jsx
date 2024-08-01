import React, { useCallback, useEffect, useState } from 'react'
import { getSinglePost } from '../../../../../Service/Apiservice/AdminApi'
import useEmblaCarousel from 'embla-carousel-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

const ImageComponent = React.lazy(
  () => import('../../../../ImageComponent/PostImage')
)
export default function ViewPost({ postId }) {
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel()
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  })

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  })
  const [post, setPost] = useState(null)
  useEffect(() => {
    const fetchPost = async (postId) => {
      const response = await getSinglePost(postId)
      if (response) {
        setPost(response)
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
    fetchPost(postId)
  }, [])

  return (
    <div className="  flex w-[80vh] h-[55vh]">
      {loading ? (
        <div className="w-full h-hull flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8  border-t-2 border-b-2 border-[#512da8]"></div>
        </div>
      ) : (
        <>
          <div className="  relative w-[50%] ">
            <div className="embla h-full " ref={emblaRef}>
              <div className="embla__container   h-full">
                {post?.imageUrls.map((image, index) => (
                  <div key={index} className="embla__slide h-full">
                    <React.Suspense
                      fallback={
                        <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                      }
                    >
                      <ImageComponent src={image?.secure_url} />
                    </React.Suspense>
                  </div>
                ))}
              </div>
            </div>
            {post?.imageUrls.length > 1 && (
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
          <div className=" p-3   w-[50%] right-view-post-container">
            <div className="flex justify-between ">
              <div className="flex ">
                <div className="w-9 ">
                  <React.Suspense
                    fallback={
                      <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                    }
                  >
                    <img
                      className="rounded-full object-contain"
                      src={post?.userId.profile.profileUrl}
                    />
                  </React.Suspense>
                </div>
                <div className="ms-3">
                  <span className="text-sm font-semibold">
                    {post.userId.userName}
                  </span>
                </div>
              </div>
            </div>
            <div className="border mt-2"></div>
            <div
              style={{ scrollbarWidth: 'none' }}
              className="pt-1 py-3 overflow-y-auto h-[330px]"
            >
              <>
                {post?.comments.length ? (
                  post?.comments.map((com, index) => (
                    <div key={index}>
                      <div className="bg-[#ede9f7] py-1 flex justify-between  mt-2">
                        <div className="flex items-top">
                          <div className="pe-4">
                            <span className="font-semibold text-xs">
                              {com?.author?.userName}
                            </span>
                            <span className="text-sm ms-1">{com.content} </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] flex gap-2 mt-1"></div>
                      {com.replies.length > 0 &&
                        com.replies.map((rep, index) => {
                          return (
                            <div
                              key={index}
                              className="flex justify-between ps-16  mt-2"
                            >
                              <div className="flex items-top">
                                <div className="pe-4">
                                  <span className="font-semibold text-xs">
                                    {rep?.author?.userName}
                                  </span>
                                  <span className="text-sm ms-1">
                                    {rep?.content}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400 text-center">
                    no comments yet
                  </div>
                )}
              </>
            </div>
            <div className="border"></div>
            <div className="text-lg flex items-center justify-between mt-2">
              <div className="">
                <div className="">
                  Total Comments{' '}
                  <span className="font-semibold">{post.comments.length}</span>
                </div>
                <div className="">
                  Total likes{' '}
                  <span className="font-semibold">{post.likes.length}</span>
                </div>
                <div className="">
                  Reports{' '}
                  <span className="font-semibold"> {post.reportCount}</span>
                </div>
              </div>
              <div className="">
                {post.isRemoved && (
                  <div className="text-md font-semibold text-red-500">
                    Post removed
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
