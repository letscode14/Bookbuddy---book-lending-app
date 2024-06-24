import { toast } from "react-toastify";

export const showSuccessToast = (message) => {
  toast.success(message, {
    className: "toast-message",
    position: "top-center",
    autoClose: 1500,
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    className: "toast-message",
    position: "top-center",
    autoClose: 2000,
  });
};

export const showAdminToast = (message) => {
  toast.success(message, {
    className: "admin-toast",
    position: "top-center",
    autoClose: 2000,
  });
};
