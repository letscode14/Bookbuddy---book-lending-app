import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import {
  getExploreBooks,
  getUsersCurrentLocation,
} from '../../../Service/Apiservice/UserApi'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../store/slice/userAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

export default function Maps({ type, getLocation }) {
  const mapContainerRef = useRef(null)
  const { user } = useSelector(selecUser)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState([])
  const [currentLocation, setCurrentLocation] = useState({
    lat: 10.946421446966283,
    long: 76.05104056676515,
  })

  useEffect(() => {
    if (mapContainerRef.current) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [currentLocation.long, currentLocation.lat],
        zoom: 7,
      })

      mapRef.current.on('click', async (event) => {
        const { lng, lat } = event.lngLat
        if (type === 'select') {
          const address = await getUsersCurrentLocation({ lat: lat, long: lng })
          getLocation(address, lat, lng)
        }

        if (markerRef.current) {
          markerRef.current.remove()
        }
        if (type) {
          markerRef.current = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(mapRef.current)
        }

        setCurrentLocation({ lat, long: lng })
      })

      return () => mapRef.current.remove()
    }
  }, [])

  useEffect(() => {
    const fetchNearBooks = async (userId) => {
      try {
        setLoading(true)
        const response = await getExploreBooks(userId)

        if (response) {
          setBooks(response.books)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.log(error)
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }
    if (!type) fetchNearBooks(user)
  }, [user, type])

  useEffect(() => {
    if (mapRef.current && books.length > 0) {
      let markersLoaded = 0
      const totalMarkers = books.length

      books.forEach((book) => {
        const { lat, lng } = book.shelf.location
        const marker = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current)

        const popup = new mapboxgl.Popup({ offset: 30 }).setHTML(`
          <div class="h-40 w-40">
            <img class="w-16" src="${book.shelf.imageUrl.secure_url}" alt="${book.shelf.bookName}" width="100"/>
            <h3>${book.shelf.bookName}</h3>
            <p>${book.shelf.author}</p>
            <div class="flex justify-between">
              <span id="username-${book.shelf.userData._id}" class="font-bold text-[#512da8] cursor-pointer">${book.shelf.userData.userName}</span>
              <span class="font-bold ${book.shelf.status === 'Lended' ? 'text-red-500' : 'text-green-500'} cursor-pointer">${book.shelf.status}</span>
            </div>
          </div>
        `)

        marker.setPopup(popup)
        popup.on('open', () => {
          const usernameElement = document.getElementById(
            `username-${book.shelf.userData._id}`
          )
          if (usernameElement) {
            usernameElement.addEventListener('click', () => {
              window.location.href = `/user/other/${book.shelf.userData._id}`
            })
          }
        })

        markersLoaded += 1
        if (markersLoaded === totalMarkers) {
          setLoading(false)
        }
      })
    }
  }, [books])

  return (
    <>
      {loading ? (
        <div className="w-full h-full flex justify-center items-center">
          <div className="pulse-container">
            <div className="wave-loading"></div>
            <div className="wave-loading"></div>
            <div className="pulse-loading flex items-center justify-center"></div>
          </div>
        </div>
      ) : (
        <div
          style={{ width: '100%', height: '100vh' }}
          ref={mapContainerRef}
          className="map-container relative"
        >
          {books.length === 0 && !type && (
            <div className="absolute top-0 left-0 z-20 w-full h-full flex flex-col justify-center items-center bg-gray-800 bg-opacity-50">
              <div>
                <p className="text-white text-2xl">
                  You {"don't"} have any books to explore
                </p>
              </div>

              <div className="text-white mt-1">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className="text-red-500"
                />{' '}
                This is because you will not be following anyone or your friends
                dont have any books in their shelf
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
