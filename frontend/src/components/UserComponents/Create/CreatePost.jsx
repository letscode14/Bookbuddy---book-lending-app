import { useLocation } from "react-router-dom";
import "./CreatePost.css";
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";

import { v4 as uuid } from "uuid";

import Cropper from "react-easy-crop";
import getCroppedImg from "../../../../helpers/ValidationHelpers/CropImage/CropImage";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { useDispatch, useSelector } from "react-redux";
import { selecUser } from "../../../store/slice/userAuth";
import { createPost } from "../../../Service/Apiservice/UserApi";
import { startLoading, stopLoading } from "../../../store/slice/loadinSlice";
import { selectLoading } from "../../../store/slice/loadinSlice";
import { useConfirmationModal } from "../../Modal/ModalContext";

//

export default function CreatePost() {
  const { showModal } = useConfirmationModal();
  const { isLoading } = useSelector(selectLoading);
  const [isMoved, setIsRoundMoved] = useState(false);
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState([]);
  const [imageId, setImage] = useState("");
  let [descLength, setDescLength] = useState(150);
  const [readOnly, setReadOnly] = useState(false);

  const contentPage = useRef(null);
  const imageInput = useRef(null);
  const { pathname } = useLocation();
  const { user } = useSelector(selecUser);
  const [booshelfAdds, setBookshelfAdds] = useState({
    bookName: "",
    author: "",
    desc: "",
    location: "",
    limit: "",
  });
  const [error, setError] = useState([]);
  const dispatch = useDispatch();

  //crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImages, setCroppedImages] = useState([]);

  useEffect(() => {
    const element = contentPage.current;
    document.title = "Create post";
    element.style.right = "12px";
  }, [pathname]);

  const handleClick = () => {
    setError([]);
    setBookshelfAdds({
      bookName: "",
      author: "",
      desc: "",
      location: "",
      limit: "",
    });
    setIsRoundMoved(!isMoved);
  };
  const addDes = (e) => {
    const value = e.target.value.replace(/\s+/g, " ");
    setDesc(value);
    setDescLength(150 - value.length);

    if (value.length >= 150) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }

    if (value.length >= 150) {
      e.preventDefault();
    }
  };
  const chooseImage = () => {
    imageInput.current.click();
  };
  const handleImageInput = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      return showErrorToast("Only 5 images allowed");
    }
    if (!files.length) return;
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      return allowedExtensions.includes(extension);
    });

    if (validFiles.length !== files.length) {
      showErrorToast("!Invalid file extentiion only jpg,jpeg,png is allowed");
      return;
    }

    const newImageUrls = [];
    let filesProcessed = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = () => {
        newImageUrls.push({
          id: uuid(),
          url: reader.result,
        });

        filesProcessed++;

        setImage(newImageUrls[index].id);
        if (filesProcessed === files.length) {
          setImageUrl((prevUrls) => [...prevUrls, ...newImageUrls]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      setReadOnly(false);
      return;
    }

    if (desc.length >= 150) {
      e.preventDefault();
    }
  };
  ////
  const removeImage = (id, index) => {
    if (imageUrl.length === 1) {
      setImage([]);
      setImageUrl([]);
      setCroppedImages([]);
      return;
    }

    if (index === 0) {
      setImage(imageUrl[index + 1]?.id);
    } else {
      setImage(imageUrl[index - 1]?.id);
    }

    setImageUrl((prevImageUrl) => prevImageUrl.filter((img) => img.id !== id));
    setCroppedImages((prevCroppedImages) =>
      prevCroppedImages.filter((img) => img.id !== id)
    );
  };

  //crop image
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    showCroppedImage();
  };
  const showCroppedImage = async () => {
    if (croppedAreaPixels && imageUrl.find((img) => img.id === imageId)?.url) {
      try {
        const croppedImageBlobUrl = await getCroppedImg(
          imageUrl.find((img) => img.id === imageId)?.url || "",
          croppedAreaPixels
        );

        const response = await fetch(croppedImageBlobUrl);

        const blob = await response.blob();
        const file = new File([blob], "croppedImage.jpg", {
          type: "image/jpeg",
        });

        setCroppedImages((prevCroppedImages) => {
          const existingImageIndex = prevCroppedImages.findIndex(
            (img) => img.id === imageId
          );

          if (existingImageIndex >= 0) {
            const updatedImages = [...prevCroppedImages];
            updatedImages[existingImageIndex] = {
              id: imageId,
              url: croppedImageBlobUrl,
              file,
            };
            return updatedImages;
          } else {
            return [
              ...prevCroppedImages,
              { id: imageId, url: croppedImageBlobUrl, file },
            ];
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  //submitting the form
  const handleSubmit = async () => {
    if (!imageUrl.length || !croppedImages.length) {
      showErrorToast("Select images to proceed");
      return;
    }

    if (!desc) {
      showErrorToast("Add image a description");
      return;
    }
    if (desc.length > 150) {
      showErrorToast("Description length is too high");
      return;
    }

    const files = croppedImages.map((file) => file.file);
    const formData = new FormData();

    if (isMoved) {
      const keys = Object.keys(booshelfAdds);
      const errorIndices = [];
      keys.forEach((key, index) => {
        if (booshelfAdds[key].trim() == "") {
          errorIndices.push(index + 1);
        }
      });

      if (errorIndices.length > 0) {
        setError(errorIndices);
        return;
      } else {
        setError([]);
        formData.append("addToBookshelf", true);
        formData.append("author", booshelfAdds.author);
        formData.append("ShelfDescription", booshelfAdds.desc);
        formData.append("bookName", booshelfAdds.bookName);
        formData.append("limit", booshelfAdds.limit);
        formData.append("location", booshelfAdds.location);
      }
    }

    files.forEach((file) => {
      formData.append("images", file);
    });
    if (desc.length > 0) {
      formData.append("description", desc);
    }

    dispatch(startLoading());

    const response = await createPost(formData, user);
    if (response.status) {
      showSuccessToast(response.message);
      setImageUrl([]);
      setDescLength(150);
      setCroppedImages([]);
      setDesc("");
      dispatch(stopLoading());
    } else {
      dispatch(stopLoading());
    }
  };

  return (
    <div
      ref={contentPage}
      className="pt-9 z-50 ps-20 create-post-content flex absolute top-3 bottom-3   bg-[#ffffff]"
    >
      <div className="left-container">
        {imageUrl.length > 0 ? (
          <div className="carousal-image-container  ">
            <div className="image-container flex  justify-between px-2 ">
              <div className="crop-image w-[65%]">
                {imageUrl.length > 0 ? (
                  <Cropper
                    image={
                      imageUrl.find((img) => img.id === imageId)?.url || ""
                    }
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 6}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                ) : (
                  ""
                )}
              </div>
              {croppedImages.length > 0 ? (
                <div className="w-[35%] crop-image-container h-full flex justify-center items-center">
                  <div className="">
                    <div className="text-center font-bold">Final review</div>
                    <img
                      className="w-48 object-contain h-48"
                      src={croppedImages.find((img) => img.id == imageId)?.url}
                      alt=""
                    />
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="flex ms-2 justify-between  items-center ">
              <div className="flex">
                {imageUrl.map((images, index) => (
                  <div
                    key={index}
                    className="thumb
                   me-2
                    
                   flex 
                   relative
                   
                 "
                  >
                    <FontAwesomeIcon
                      className=" absolute text-lg bottom-[-4px] right-[-6px] text-red-600"
                      icon={faXmark}
                      onClick={() =>
                        showModal("Are you sure to remove this ?", "user", () =>
                          removeImage(images.id, index)
                        )
                      }
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
                <button
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
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              onClick={chooseImage}
              className="image-upload  flex justify-center items-center"
            >
              <div className="text-center">
                <FontAwesomeIcon className="h-8" icon={faUpload} />
                <div className="font-semibold text-xl">
                  Select Files to uplaod{" "}
                </div>
                <div className="text-xs text-slate-400">
                  or drag and top your files here{" "}
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
          </>
        )}
        <div className=" relative">
          <textarea
            value={desc}
            onKeyDown={handleKeyDown}
            onChange={addDes}
            placeholder="description"
            className="mt-3 description"
            readOnly={readOnly}
          ></textarea>
          <div className="text-slate-400 text-[15px] absolute  bottom-2 right-3 ">
            {descLength}
          </div>
        </div>

        <div className="flex items-center mt-2">
          <div className="w-10 h-5 p-[2px] access-button">
            <div
              className={` h-full w-4 rounded-full border ${
                isMoved ? "translate-x-full bg-[#512da8]" : "bg-slate-300"
              }`}
              style={{
                transition: "transform 0.3s ease-in-out",
              }}
              onMouseDown={handleClick}
            ></div>
          </div>
          <div className="ms-2 text-xs text-slate-400">Add to bookshelf</div>
        </div>
        <div className={isMoved ? "" : "hidden"}>
          <div className="bookshelf-adds mt-2 flex justify-between">
            <div className="">
              <input
                onChange={(e) =>
                  setBookshelfAdds((prev) => ({
                    ...prev,
                    bookName: e.target.value,
                  }))
                }
                className=" w-[290px] rounded-lg py-2 bookshelf-input"
                placeholder="book name"
              />
              <div
                className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
                  error.includes(1) ? "" : "opacity-0"
                }`}
              >
                field is required
              </div>
            </div>
            <div>
              <input
                className="w-[290px] rounded-lg py-2 bookshelf-input"
                placeholder="author"
                onChange={(e) =>
                  setBookshelfAdds((prev) => ({
                    ...prev,
                    author: e.target.value,
                  }))
                }
              />
              <div
                className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
                  error.includes(2) ? "" : "opacity-0"
                }`}
              >
                field is required
              </div>
            </div>
          </div>
          <textarea
            onChange={(e) =>
              setBookshelfAdds((prev) => ({
                ...prev,
                desc: e.target.value,
              }))
            }
            placeholder="description"
            className="mt-1 description"
          ></textarea>
          <div
            className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
              error.includes(3) ? "" : "opacity-0"
            }`}
          >
            field is required
          </div>
          <div className=" mt-2 flex justify-between gap-5">
            <div className="w-full">
              <input
                className="w-full + rounded-lg py-2 bookshelf-input"
                placeholder="location"
                onChange={(e) =>
                  setBookshelfAdds((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
              <div
                className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
                  error.includes(4) ? "" : "opacity-0"
                }`}
              >
                field is required
              </div>
            </div>

            <div className="bookshelf-adds  ">
              <select
                onChange={(e) =>
                  setBookshelfAdds((prev) => ({
                    ...prev,
                    limit: e.target.value,
                  }))
                }
                style={{ border: "0.5px solid #7d7b7b", borderRadius: "8px" }}
                className="py-2.5 text-sm text-gray-400  focus:text-black w-full"
              >
                <option value="">Select the period limit to lend </option>
                <option value="1" className="text-black">
                  1 day
                </option>
                <option value="7" className="text-black">
                  7 days
                </option>
                <option value="15" className="text-black">
                  15 days
                </option>
                <option value="30" className="text-black">
                  30 days
                </option>
              </select>
              <div
                className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
                  error.includes(5) ? "" : "opacity-0"
                }`}
              >
                field is required
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center ">
          <button
            disabled={isLoading}
            onClick={handleSubmit}
            className="submit-button  flex justify-center items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4   border-t-2 border-b-2 border-white-900"></div>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
