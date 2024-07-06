import './App.css'
import Pages from './Pages/Pages'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ConfirmationModalProvider } from './components/Modal/ModalContext'
import { SocketProvider } from './Socket/SocketContext'
import { MenuProvider } from './Context/Context'

function App() {
  return (
    <div className="app-container">
      <SocketProvider>
        <ToastContainer />

        <ConfirmationModalProvider>
          <MenuProvider>
            <Pages />
          </MenuProvider>
        </ConfirmationModalProvider>
      </SocketProvider>
    </div>
  )
}

export default App
