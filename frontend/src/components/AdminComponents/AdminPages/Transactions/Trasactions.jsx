import { useEffect, useState } from 'react'
import Lended from './Lended/Lended'
import Borrowed from './Borrowed/Borrowed'

export default function Trasactions() {
  const [menu, setMenu] = useState(2)
  useEffect(() => {
    document.title = 'Transactions'
  }, [])
  return (
    <div className="bg-[#ffffff] max-h-[800px] h-[800px] relative rounded-2xl mt-4">
      <div className="h-20 flex gap-9 items-center  justify-between">
        <div className="flex items-center ">
          <span className="font-semibold text-2xl ms-4 uppercase">
            Transactions
          </span>
          <div className="gap-5 text-lg flex items-center relative w-full flex ms-10">
            <div
              onClick={() => setMenu(1)}
              className={`${menu == 1 && 'duration-500 transition-all border px-4 bg-[#51557e] text-[#ffffff] py-1 rounded-lg'} cursor-pointer`}
            >
              Lended
            </div>
            <div
              onClick={() => setMenu(2)}
              className={`${menu == 2 && 'duration-500 transition-all border px-4 bg-[#51557e] text-[#ffffff] py-1 rounded-lg'} cursor-pointer`}
            >
              Borrowed
            </div>
          </div>
        </div>
      </div>
      <div className="border-line"></div>

      {menu == 1 && <Lended />}
      {menu == 2 && <Borrowed />}
    </div>
  )
}
