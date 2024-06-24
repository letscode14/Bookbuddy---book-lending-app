import { createContext, useContext, useState } from "react";
import Modal from "./Modal";
const ConfirmationModalContext = createContext();

export const useConfirmationModal = () => {
  return useContext(ConfirmationModalContext);
};

export const ConfirmationModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => {});
  const [isFor, setType] = useState("");

  const showModal = (title, type, onConfirm) => {
    setTitle(title);
    setOnConfirm(() => onConfirm);
    setIsOpen(true);
    setType(type);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ConfirmationModalContext.Provider value={{ showModal }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={title}
        onConfirm={onConfirm}
        type={isFor}
      />
    </ConfirmationModalContext.Provider>
  );
};
