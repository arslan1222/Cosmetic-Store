import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user } = useAuth();
  // Admin/vendor dashboards are internal tools, not the shopfront -- the
  // marketing footer (shop links, boutiques, "become a vendor") doesn't
  // belong there and would just bounce them back via the route guard.
  const isStaff = user?.role === "admin" || user?.role === "vendor";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 page-enter">{children}</main>
      {!isStaff && <Footer />}
    </div>
  );
}
