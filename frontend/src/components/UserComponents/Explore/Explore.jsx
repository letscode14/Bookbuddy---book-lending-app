import React, { useEffect, useRef } from 'react'
import Maps from '../Maps/Maps'
import './Explore.css'
import ReponsiveNav from '../Navbar/ReponsiveNav'

const ImageComponent = React.lazy(() => import('../../ImageComponent/Image'))

export default function Explore() {
  const exploreContainer = useRef()

  return (
    <>
      <ReponsiveNav />
      <div
        ref={exploreContainer}
        className=" overflow-auto right-[12px] rounded-[40px] xs:left-1 explore-content absolute top-3 bottom-3 flex   bg-[#ffffff] 
        xs:left-1 xs:right-1 xs:rounded-[10px] xs:top-1 xs:bottom-1
         sm:left-20 sm:pe-0 sm:ps-0 
         md:left-[230px]
         lg:left-[280px]"
      >
        <Maps />
      </div>
    </>
  )
}
