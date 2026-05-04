import { HashRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Admin from "./pages/Admin";
import "./styles/global.css";
import "./pages/Home.css";
import "./pages/Catalogo.css";
import "./pages/Admin.css";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/*" element={
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalogo />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </HashRouter>
  );
}
