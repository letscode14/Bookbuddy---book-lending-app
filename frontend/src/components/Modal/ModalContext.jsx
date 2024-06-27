import { createContext, useContext, useState } from "react";
import Modal from "./Modal";

const ConfirmationModalContext = createContext();

export const useConfirmationModal = () => {
  return useContext(ConfirmationModalContext);
};

export const ConfirmationModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [onConfirm, setOnConfirm] = useState(null);

  const showModal = (title, type, onConfirmCallback) => {
    setTitle(title);
    setType(type);
    setOnConfirm(() => onConfirmCallback);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ConfirmationModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={title}
          onConfirm={onConfirm}
          type={type}
        />
      )}
    </ConfirmationModalContext.Provider>
  );
};
