import { useEffect, useRef, useState } from 'react'
import PostReport from './PostReport/PostReport'
import ViewRep from '../../Post/ViewReports/ViewReports'

export default function ViewReports({ userId }) {
  const [menu, setMenu] = useState(0)
  const menuline = useRef(null)

  useEffect(() => {
    if (menuline.current) {
      const m = menuline.current

      switch (menu) {
        case 0:
          m.style.left = '-3px'
          m.style.width = '43px'
          break
        case 1:
          m.style.left = '49px'
          m.style.width = '82px'
          break
        case 2:
          m.style.left = '137px'
          m.style.width = '114px'
          break
      }
    }
  })
  return (
    <div className="admin-view-reports px-8 pt-10 ">
      <div className="flex text-[15px] gap-3">
        <div
          onClick={() => setMenu(0)}
          className={` uppercase cursor-pointer font-semibold ${menu == 0 ? 'text-[#000000]' : 'text-gray-400'}`}
        >
          Post
        </div>
        <div
          onClick={() => setMenu(1)}
          className={`cursor-pointer uppercase font-semibold ${menu == 1 ? 'text-[#000000]' : 'text-gray-400'}`}
        >
          Account
        </div>
        {/* <div
          onClick={() => setMenu(2)}
          className={` uppercase font-semibold ${menu == 2 ? 'text-[#000000]' : 'text-gray-400'}`}
        >
          Transaction
        </div> */}
      </div>
      <div className="border relative">
        <div
          ref={menuline}
          className="transition-all duration-100 border absolute top-0 border-[#000000] border-2"
        ></div>
      </div>
      <div className="w-full pb-2   h-[700px]">
        {menu == 0 && <PostReport userId={userId} />}
        {menu == 1 && <ViewRep postId={userId} />}
      </div>
    </div>
  )
}
