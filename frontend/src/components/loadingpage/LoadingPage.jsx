import Logo from '/images/Logo2.png'
export default function LoadingPage() {
  return (
    <div className="h-screen w-screen content-center flex items-center justify-center z-50 ">
      <div className="w-48">
        <img src={Logo} />
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12  border-t-4 mt-2 border-b-4 border-white-900"></div>
        </div>
      </div>
    </div>
  )
}
