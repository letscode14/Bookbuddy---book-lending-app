import "./App.css";
import Pages from "./Pages/Pages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmationModalProvider } from "./components/Modal/ModalContext";

function App() {
  return (
    <div className="app-container">
      <ToastContainer />
      <ConfirmationModalProvider>
        <Pages />
      </ConfirmationModalProvider>
    </div>
  );
}

export default App;
