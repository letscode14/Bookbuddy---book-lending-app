import { useEffect, useState } from 'react'
import UserStatistics from './UserStatistics/UserStatistics'
import PostStatistics from './PostStatistics/PostStatistics'
import TransactionStatistics from './TransactionStatistics/TransactionStatistics'

export default function Dashboard() {
  const [menu, setMenu] = useState(1)
  useEffect(() => {
    document.title = 'Dashboard'
  }, [])
  return (
    <div className="bg-[#ffffff] grow  relative rounded-2xl mt-4">
      <div className="h-16 flex gap-9 items-center  justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-nowrap text-2xl ms-4 uppercase">
            Dashboard
          </span>
          <div className="gap-5 text-lg flex items-center relative w-full flex ms-10">
            <div
              onClick={() => setMenu(1)}
              className={`w-40 text-center ${menu == 1 && ' duration-500 transition-all border px-4 bg-[#51557e] text-[#ffffff] py-1 rounded-lg'} cursor-pointer`}
            >
              Users statics
            </div>
            <div
              onClick={() => setMenu(2)}
              className={`w-40 text-center ${menu == 2 && 'duration-500 transition-all border px-4 bg-[#51557e] text-[#ffffff] py-1 rounded-lg'} cursor-pointer`}
            >
              Post statistics
            </div>
            {/* <div
              onClick={() => setMenu(3)}
              className={` w-40 text-center ${menu == 3 && 'duration-500 transition-all border px-4 bg-[#51557e] text-[#ffffff] py-1 rounded-lg'} cursor-pointer`}
            >
              Books statistics
            </div> */}
            <div
              onClick={() => setMenu(4)}
              className={`w-52 text-center ${menu == 4 && 'duration-500 transition-all border px-2 bg-[#51557e] text-[#ffffff] py-1 rounded-lg'} cursor-pointer`}
            >
              Transactions statistics
            </div>
          </div>
        </div>
      </div>
      <div className="border-line"></div>

      <div className="overflow-y-auto h-[720px] p-4">
        <>
          {menu == 1 && <UserStatistics />}
          {menu == 2 && <PostStatistics />}
          {menu == 4 && <TransactionStatistics />}
        </>
      </div>
    </div>
  )
}
