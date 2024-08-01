import React from 'react'
import './Post.css'

import { useEffect, useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImages, faSadTear } from '@fortawesome/free-solid-svg-icons'
import { fetchPost, getPost } from '../../../../Service/Apiservice/UserApi'
import ContentModal from '../../../Modal/ContentModal'
import PostView from '../PostView/PostView'
const ImageComponent = React.lazy(() => import('../../../ImageComponent/Image'))

export default function Post({ user }) {
  const [post, setPost] = useState()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [postDetails, setPostDetails] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      const response = await getPost(user)
      if (response) {
        setPost(response)
        setLoading(false)
      }
    }
    fetchPost()
  }, [])

  const handleContentClose = () => {
    setIsModalOpen(false)
  }

  const getSinglePost = async (postId) => {
    try {
      const response = await fetchPost({ postId })
      if (response) {
        console.log(response)
        setPostDetails(response)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {loading ? (
        <div className="mt-6 flex justify-center items-baseline  w-full">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
          <span className="ms-3 text-gray-500">loading... </span>
        </div>
      ) : (
        <>
          <ContentModal
            isContentModalOpen={isModalOpen}
            onContentClose={handleContentClose}
          >
            <PostView postData={postDetails} user={postDetails.userId} />
          </ContentModal>
          <div
            className="relative mt-4 pb-10 grid grid-cols-4 gap-4  
           mx-20 xs:mx-2 xs:grid-cols-3  xs:gap-1 
           sm:mx-3
            lg:mx-20"
          >
            {post.length > 0 ? (
              post.map((posts, index) => (
                <div
                  onClick={() => getSinglePost(posts._id)}
                  key={index}
                  className="aspect-square shadow border flex rounded-xl overflow-hidden justify-center items-center relative  "
                >
                  {posts.imageUrls?.length > 1 && (
                    <FontAwesomeIcon
                      icon={faImages}
                      className="text-[#ffffff] absolute right-3 text-xl top-2"
                    />
                  )}
                  <React.Suspense
                    fallback={
                      <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                    }
                  >
                    <ImageComponent src={posts.imageUrls[0].secure_url} />
                  </React.Suspense>
                </div>
              ))
            ) : (
              <div
                className="w-full absolute text-center 
               text-lg text-gray-400"
              >
                No posts yet <FontAwesomeIcon icon={faSadTear} />
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
