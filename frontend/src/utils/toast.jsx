import { toast } from 'react-toastify'
export const showSuccessToast = (message) => {
  toast.success(message, {
    className: 'toast-message',
    position: 'top-center',
    autoClose: 2500,
  })
}

export const showErrorToast = (message) => {
  toast.error(message, {
    className: 'toast-message',
    position: 'top-center',
    autoClose: 2000,
  })
}

export const showAdminToast = (message) => {
  toast.success(message, {
    className: 'admin-toast',
    position: 'top-center',
    autoClose: 2000,
  })
}

export const likeToast = (data, message) => {
  const CustomToast = ({ message }) => (
    <div className="w-full min-w-[250px]">
      <div className="flex">
        <img
          src={data.actionBy.profile.profileUrl}
          alt="Notification"
          className="w-10 h-10 rounded-full"
        />
        <span className="text-md ms-1 font-semibold">
          {data.actionBy.userName}
        </span>
      </div>

      <p className="text-sm ">{message}</p>
    </div>
  )
  toast(<CustomToast message={message}></CustomToast>, {
    autoClose: 2000,
    position: 'bottom-right',
    className: 'notification-toast',
  })
}

export const followToast = (data, message) => {
  const CustomToast = ({ message }) => (
    <div>
      <div className="flex">
        <img
          src={data.userProfile}
          alt="Notification"
          className="w-9 h-9 rounded-full"
        />
        <span className="text-md ms-1 font-semibold">{data.userName}</span>
      </div>

      <p className="text-sm ">{message}</p>
    </div>
  )
  toast(<CustomToast message={message}></CustomToast>, {
    autoClose: 2000,
    position: 'bottom-right',
    className: 'notification-toast',
  })
}

export const commentToast = (imageUrl, content, userName, message) => {
  const CustomToast = ({ message }) => (
    <div>
      <div className="flex">
        <img
          src={imageUrl}
          alt="Notification"
          className="w-9 h-9 rounded-full"
        />
        <div className="text-start ms-3">
          <span className="text-md ms-1 font-semibold ">{userName}</span>

          <div className="text-xs ">{content}</div>
        </div>
      </div>

      <div className="text-sm text-wrap mt-2">{message}</div>
    </div>
  )

  toast(<CustomToast message={message}></CustomToast>, {
    autoClose: 2000,
    position: 'bottom-right',
    className: 'notification-toast',
  })
}

export const messageToast = (content, userName, message, profile) => {
  const CustomToast = ({ message }) => (
    <div>
      <div className="text-sm text-wrap mt-2">{message}</div>
    </div>
  )

  toast(<CustomToast message={message}></CustomToast>, {
    autoClose: 2000,
    position: 'bottom-right',
    className: 'notification-toast',
  })
}

export const requestToast = (
  content,
  userName,
  message,
  profile,
  bookProfile
) => {
  const CustomToast = ({ message }) => (
    <div>
      <div className="flex">
        <img
          src={profile}
          alt="Notification"
          className="w-9 h-9 rounded-full"
        />
        <img
          src={bookProfile}
          alt="Notification"
          className="w-9 h-9 ms-1 rounded-full"
        />
        <div className="text-start ms-3">
          <span className="text-md ms-1 font-semibold ">{userName}</span>

          <div className="text-xs ">{content}</div>
        </div>
      </div>

      <div className="text-sm text-wrap mt-2">{message}</div>
    </div>
  )

  toast(<CustomToast message={message}></CustomToast>, {
    autoClose: 2000,
    position: 'bottom-right',
    className: 'request-toast',
  })
}
