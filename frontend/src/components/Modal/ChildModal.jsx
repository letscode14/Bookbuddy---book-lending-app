import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
export default function ChildModal({ isOpen, onClose, children }) {
  return (
    <Transition show={isOpen}>
      <Dialog className="relative z-50  fixed inset-0" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed  inset-0 z-50 w-screen overflow-y-auto">
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 xs:w-full">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className={`relative z-50 transform overflow-hidden rounded-lg 
                   bg-[#ffffff]
                 text-left shadow-xl transition-all sm:my-8 fit-content relative`}
              >
                {children}
                <FontAwesomeIcon
                  className="absolute top-5 right-5 text-xl"
                  onClick={onClose}
                  icon={faXmark}
                />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
