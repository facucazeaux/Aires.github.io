import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTER_BASENAME } from "./config";
import PublicLayout from "./layouts/PublicLayout";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToHash from "./components/ScrollToHash";
import SiteHead from "./components/SiteHead";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Producto from "./pages/Producto";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import "./styles/global.css";
import "./components/ErrorState.css";
import "./pages/Home.css";
import "./pages/Catalogo.css";
import "./pages/Producto.css";
import "./pages/Admin.css";
import "./pages/NotFound.css";

export default function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <ScrollToTop />
      <ScrollToHash />
      <SiteHead />
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="catalogo/:categoria" element={<Catalogo />} />
          <Route path="producto/:slug" element={<Producto />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
