import LoginContainer from "./components/loginContainer";
import NavBar from "./components/navbar/Navbar";
import HomePage from "./pages/home_page";
import LoginPage from "./pages/login_page";
import RegisterPage from "./pages/register_page";
import HistoryPage from "./pages/history_page";
import ReportPage from "./pages/report_page";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route element={<LoginContainer />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<NavBar />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Route>
    </Routes>
  );
}

export default App;
