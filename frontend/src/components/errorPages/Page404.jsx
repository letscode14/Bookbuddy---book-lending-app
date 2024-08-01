import { useEffect } from 'react'

export default function Page404() {
  useEffect(() => {
    document.title = '404'
  })
  return (
    <div className="z-50 bg-[#ffffff] absolute top-0 left-0 right-0 bottom-0">
      <div className="w-screen h-screen flex justify-center items-center">
        <div>
          <span className="font-bold text-[150px] text-zinc-400 ">404</span>

          <span className="ms-5 font-semibold text-red-500 text-3xl">
            Route not found
          </span>
        </div>
      </div>
    </div>
  )
}
