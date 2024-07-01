import "./App.css";
import Pages from "./Pages/Pages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmationModalProvider } from "./components/Modal/ModalContext";
import { SocketProvider } from "./Socket/SocketContext";

function App() {
  return (
    <div className="app-container">
      <SocketProvider>
        <ToastContainer />

        <ConfirmationModalProvider>
          <Pages />
        </ConfirmationModalProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
