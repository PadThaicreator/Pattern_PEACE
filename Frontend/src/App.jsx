import LoginContainer from "./components/loginContainer";
import NavBar from "./components/navbar";
import HomePage from "./pages/home_page";
import LoginPage from "./pages/login_page";
import RegisterPage from "./pages/register_page";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>

      <Route element={<LoginContainer />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>


       <Route element={<NavBar />}>
        <Route path="/home" element={<HomePage />} />
       </Route>
      
    </Routes>
  );
}

export default App;
