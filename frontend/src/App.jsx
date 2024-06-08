import Login from "./components/UserComponents/Login/Login.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
