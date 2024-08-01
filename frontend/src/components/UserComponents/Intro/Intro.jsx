import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useState } from 'react'
import Logo from '/images/Logo2.png'
import image1 from '/images/46546252.jpg'
import image2 from '/images/3929712.jpg'
import image3 from '/images/Screenshot 2024-07-29 201714.png'
import image4 from '/images/Screenshot 2024-07-29 203515.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAward, faLocation } from '@fortawesome/free-solid-svg-icons'
import Subscribe from '../Subscribe/Subscribe'

export default function Intro({ onClose }) {
  const [emblaRef, emblaApi] = useEmblaCarousel()
  const [imIn, setIamIn] = useState(false)
  const scrollPrev = useCallback(() => {
    setIamIn(false)
    if (emblaApi) emblaApi.scrollPrev()
  })

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      const lastIndex = emblaApi.slideNodes().length - 1
      const currentIndex = emblaApi.selectedScrollSnap()

      if (currentIndex === lastIndex - 1) {
        emblaApi.scrollNext()
        setIamIn(true)
      } else if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      }
    }
  }, [emblaApi, setIamIn])
  return (
    <div className="max-w-[800px] max-h-[600px]">
      <div className="embla h-full " ref={emblaRef}>
        <div className="embla__container   h-full">
          <div
            className="embla__slide h-full w-full    
            sm:w-[800px] sm:h-[460px] sm:p-4"
          >
            <div>
              <img src={Logo} className="h-16" alt="" />
            </div>
            <div className="flex gap-4 grow h-full items-start ">
              <div className=" w-[50%] mt-12">
                <div className="text-2xl font-medium">Welcome to !</div>
                <div className="text-4xl font-semibold mt-3 text-[#512da8]">
                  BookBuddy.in
                </div>
                <div className="text-sm mt-2">
                  Welcome to{' '}
                  <span className="text-[#512da8] font-semibold">
                    BookBuddy,
                  </span>{' '}
                  the ultimate platform for book lovers to connect and share
                  their favorite reads for a designated period, then return
                  them. Dive into a community where sharing stories fosters
                  friendships and expands horizons. Explore new genres, discover
                  hidden gems, and experience the joy of exchanging knowledge
                  with like-minded readers. Our platform is dedicated solely to
                  book-related content, ensuring a focused environment for
                  sharing posts, recommendations, and discussions about all
                  things literary
                </div>
              </div>
              <div className="w-[40%] ">
                <img src={image1} alt="" className="rounded-2xl shadow-lg" />
              </div>
            </div>
          </div>
          <div
            style={{ scrollbarWidth: 'thin' }}
            className="embla__slide overflow-y-auto  sm:w-[800px] sm:h-[460px] sm:p-4"
          >
            <div>
              <img src={Logo} className="h-16" alt="" />
            </div>

            <div className="flex justify-between px-10 ">
              <img src={image3} alt="" className="shadow rounded-xl h-40" />
              <div className="ms-10">
                Easily add your favorite books to your{' '}
                <span className="font-semibold">virtual bookshelf,</span>
                creating a personalized collection that reflects your literary
                tastes and interests. With our innovative{' '}
              </div>
            </div>
            <div className="flex justify-between px-10 mt-4">
              <div className="me-10">
                With our innovative{' '}
                <span className="font-semibold">
                  map{' '}
                  <FontAwesomeIcon icon={faLocation} className="text-red-500" />
                </span>{' '}
                feature, easily explore nearby books available for swap,
                enriching your reading journey with diverse genres and hidden
                gems
              </div>

              <img src={image2} alt="" className="shadow rounded-xl h-40" />
            </div>
            <div className="flex justify-between px-10 ">
              <img src={image4} alt="" className="shadow rounded-xl h-40" />
              <div className="ms-10">
                At BookBuddy, we celebrate your love for books with a unique{' '}
                <span className="font-semibold">
                  lending and borrowing experience.
                </span>
                Engage in our vibrant community by sharing your favorite reads
                for a set duration and returning them with care. Earn badges{' '}
                <FontAwesomeIcon icon={faAward} className="text-[#512da8]" />{' '}
                that reflect your lending score, recognizing your contributions
                to the literary exchange. Easily add your favorite books to your
                creating a personalized collection that reflects your literary
                tastes and interests. With our innovative{' '}
              </div>
            </div>
          </div>
          <div
            style={{ scrollbarWidth: 'thin' }}
            className="embla__slide h-full overflow-auto  sm:w-[800px] sm:h-[460px] "
          >
            <div>
              <img src={Logo} className="h-16" alt="" />
            </div>
            <Subscribe />
          </div>
        </div>
      </div>
      <div className="justify-end gap-3 px-3 py-3 flex">
        <button
          onClick={scrollPrev}
          className="border py-1 w-24 rounded-xl bg-[#512da8] text-[#ffffff] px-3"
        >
          prev
        </button>
        {imIn ? (
          <button
            onClick={() => onClose()}
            className="border py-1 w-24 px-3 rounded-xl bg-[#512da8] text-[#ffffff] px-3"
          >
            {"Iam' in"}
          </button>
        ) : (
          <button
            onClick={scrollNext}
            className="border py-1 w-24 px-3 rounded-xl bg-[#512da8] text-[#ffffff] px-3"
          >
            next
          </button>
        )}
      </div>
    </div>
  )
}
