import { useCallback, } from "react";
import React from "react";
import "./PostView.css";
import useEmblaCarousel from "embla-carousel-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as SolidHeart } from "@fortawesome/free-solid-svg-icons";

export default function PostView({ post, user }) {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  });
  const createdAt = new Date(post.createdAt).toDateString();
  return (
    <div className="  flex w-[80vh] h-[55vh]">
      <div className="  relative w-[50%] ">
        <div className="embla h-full " ref={emblaRef}>
          <div className="embla__container   h-full">
            {post.imageUrls.map((image, index) => (
              <div key={index} className="embla__slide h-full">
                <img className="w-full" src={image.secure_url} />
              </div>
            ))}
          </div>
        </div>
        {post.imageUrls.length > 1 && (
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
                  src={user.profileUrl}
                />
              </React.Suspense>
            </div>
            <div className="ms-3">
              <span className="text-sm font-semibold">{user.userName}</span>
            </div>
          </div>
          <div>
            <FontAwesomeIcon className="me-6 text-md" icon={faEllipsis} />
          </div>
        </div>
        <div className="border mt-2"></div>
        <div className=" overflow-y-auto h-[330px]">
          <>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-xs">_diluu</span>
                <span className="text-sm ms-1"> this is a good one</span>
              </div>
              <div>
                <FontAwesomeIcon className="text-xs" icon={faHeart} />
              </div>
            </div>
            <div className="text-[11px] flex gap-2 ">
              <div className="text-gray-400  font-semibold">reply</div>
              <span className="text-gray-400  font-semibold">5 days ago</span>
            </div>
          </>
        </div>
        <div className="border"></div>
        <div className="flex mt-1 mb-1 justify-between items-center">
          <FontAwesomeIcon
            className={`text-2xl ${
              post.likes.some((like) => like._id == user._id)
                ? "text-red-400"
                : ""
            }`}
            icon={
              post.likes.some((like) => like._id == user._id)
                ? SolidHeart
                : faHeart
            }
          />
          <span className="text-sm text-[#512da8] font-bold">Get the book</span>
        </div>
        <div className="text-xs mt-1 font-semibold">
          {post.likes.length > 0 ? (
            <>
              Liked By {post.likes[0].userName}{" "}
              {post.likes.length > 1 && `and ${post.likes.length - 1} others`}
            </>
          ) : (
            <span>0 Likes</span>
          )}
        </div>
        <div className="text-xs text-gray-400">{createdAt}</div>
        <div className="border my-1"></div>
        <div className="text-sm">
          <input
            className="post-view-add-comment w-full "
            placeholder="add comment"
          />
        </div>
      </div>
    </div>
  );
}
