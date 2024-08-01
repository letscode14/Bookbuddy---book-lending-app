import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
const ImageComponent = React.lazy(() => import('../../ImageComponent/Image'))

export default function PostSlide({ imageUrls }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  })

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  })
  return (
    <>
      <div className="embla relative  h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {imageUrls.map((image, index) => (
            <div key={index} className="embla__slide ">
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <ImageComponent src={image.secure_url} />
              </React.Suspense>
            </div>
          ))}
        </div>
        {imageUrls.length > 1 && (
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
    </>
  )
}
