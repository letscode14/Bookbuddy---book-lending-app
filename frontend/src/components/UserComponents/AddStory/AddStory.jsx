import { faUpload, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRef, useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../../utils/toast'
import { v4 as uuid } from 'uuid'
import Cropper from 'react-easy-crop'
import './AddStory.css'
import getCroppedImg from '../../../../helpers/ValidationHelpers/CropImage/CropImage'
import { useConfirmationModal } from '../../Modal/ModalContext'
import { addStory } from '../../../Service/Apiservice/UserApi'

export default function AddStory({ user, close }) {
  const [loading, setLoading] = useState(false)
  const imageInput = useRef(null)
  const [imageId, setImage] = useState('')
  const [imageUrl, setImageUrl] = useState([])

  const { showModal } = useConfirmationModal()

  //crop
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedImages, setCroppedImages] = useState([])

  const handleImageInput = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 1) {
      return showErrorToast('Only 1 images allowed')
    }
    if (!files.length) return
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']

    const validFiles = files.filter((file) => {
      const extension = file.name.split('.').pop().toLowerCase()
      return allowedExtensions.includes(extension)
    })

    if (validFiles.length !== files.length) {
      showErrorToast('!Invalid file extentiion only jpg,jpeg,png is allowed')
      return
    }
    const newImageUrls = []
    let filesProcessed = 0

    files.forEach((file, index) => {
      const reader = new FileReader()

      reader.onload = () => {
        newImageUrls.push({
          id: uuid(),
          url: reader.result,
        })

        filesProcessed++

        setImage(newImageUrls[index].id)
        if (filesProcessed === files.length) {
          setImageUrl((prevUrls) => [...prevUrls, ...newImageUrls])
        }
      }

      reader.readAsDataURL(file)
    })
  }
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
    showCroppedImage()
  }

  const showCroppedImage = async () => {
    if (croppedAreaPixels && imageUrl.find((img) => img.id === imageId)?.url) {
      try {
        const croppedImageBlobUrl = await getCroppedImg(
          imageUrl.find((img) => img.id === imageId)?.url || '',
          croppedAreaPixels
        )

        const response = await fetch(croppedImageBlobUrl)

        const blob = await response.blob()
        const file = new File([blob], 'croppedImage.jpg', {
          type: 'image/jpeg',
        })

        setCroppedImages((prevCroppedImages) => {
          const existingImageIndex = prevCroppedImages.findIndex(
            (img) => img.id === imageId
          )

          if (existingImageIndex >= 0) {
            const updatedImages = [...prevCroppedImages]
            updatedImages[existingImageIndex] = {
              id: imageId,
              url: croppedImageBlobUrl,
              file,
            }
            return updatedImages
          } else {
            return [
              ...prevCroppedImages,
              { id: imageId, url: croppedImageBlobUrl, file },
            ]
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  const removeImage = (id, index) => {
    if (imageUrl.length === 1) {
      setImage([])
      setImageUrl([])
      setCroppedImages([])
      return
    }

    if (index === 0) {
      setImage(imageUrl[index + 1]?.id)
    } else {
      setImage(imageUrl[index - 1]?.id)
    }

    setImageUrl((prevImageUrl) => prevImageUrl.filter((img) => img.id !== id))
    setCroppedImages((prevCroppedImages) =>
      prevCroppedImages.filter((img) => img.id !== id)
    )
  }
  const handleSubmit = async () => {
    try {
      if (!imageUrl.length || !croppedImages.length) {
        showErrorToast('Select images to proceed')
        return
      }

      const files = croppedImages.map((file) => file.file)
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('images', file)
      })

      setLoading(true)
      const response = await addStory(formData, user)
      if (response) {
        console.log(response)
        close()
        showSuccessToast('story uploaded')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[500px] h-[600px] pt-7 px-8 xs:w-full">
      {imageUrl.length > 0 ? (
        <div className="addstory-carousal-image-container">
          <div className="image-container  ">
            <div className="crop-image ">
              {imageUrl.length > 0 ? (
                <Cropper
                  image={imageUrl.find((img) => img.id === imageId)?.url || ''}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 6}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              ) : (
                ''
              )}
            </div>
          </div>
          {croppedImages.length > 0 ? (
            <div className="flex ms-2 justify-between  items-center ">
              <div className="flex">
                {croppedImages.map((images, index) => (
                  <div
                    key={index}
                    className="add-story-thumb
                me-2
                 
                flex 
                relative
                
              "
                  >
                    <FontAwesomeIcon
                      className=" absolute text-lg bottom-[-4px] right-[-6px] text-red-600"
                      icon={faXmark}
                      onClick={() => removeImage(images.id, index)}
                    />
                    <img
                      className=" object-cover h-full w-full "
                      src={images.url}
                      key={index}
                      onClick={() => setImage(images.id)}
                    />
                  </div>
                ))}
              </div>
              <div className="me-2">
                {/* <button
                  className="add-more-button"
                  onClick={() => imageInput.current.click()}
                >
                  add more
                </button>
                <input
                  onChange={handleImageInput}
                  type="file"
                  ref={imageInput}
                  className="hidden"
                  multiple
                /> */}
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      ) : (
        <div
          onClick={() => imageInput.current.click()}
          className="border-dashed border-2 flex items-center justify-center rounded-lg h-[85%]"
        >
          <div className="text-center">
            <FontAwesomeIcon className="h-8" icon={faUpload} />
            <div className="font-semibold text-xl">Select Files to uplaod </div>
            <div className="text-xs text-slate-400">
              or drag and top your files here{' '}
            </div>
            <input
              onChange={handleImageInput}
              type="file"
              ref={imageInput}
              className="hidden"
              multiple
            />
          </div>
        </div>
      )}

      <div className=" flex justify-center my-3 ">
        <button
          onClick={handleSubmit}
          className="uppercase bg-[#512da8] items-center flex justify-center font-semibold text-[#ffffff] border py-1 min-h-9 px-4 min-w-40 rounded-xl text-sm"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            'Add story'
          )}
        </button>
      </div>
    </div>
  )
}
