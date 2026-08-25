import { Outlet } from "react-router-dom";
import SkipLink from "../components/SkipLink";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PublicLayout() {
  return (
    <>
      <SkipLink />
      <Header />
      <div id="main-content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
