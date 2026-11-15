import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Store,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";

const NAV_LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/stores", label: "Boutiques" },
  { to: "/shop?category=Skincare", label: "Skincare" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  // Admins and vendors run the platform, they don't shop on it -- hide the
  // storefront nav/search/cart for them and surface their dashboard instead.
  const isStaff = user?.role === "admin" || user?.role === "vendor";

  // Search
  const handleSearch = (e) => {
    e.preventDefault();

    const searchQuery = query.trim();

    navigate(
      searchQuery
        ? `/shop?q=${encodeURIComponent(searchQuery)}`
        : "/shop"
    );

    setMenuOpen(false);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Close menus
      setAccountOpen(false);
      setMenuOpen(false);

      // Redirect to login
      navigate("/login", {
        replace: true,
      });
    }
  };

  // Dashboard according to role
  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "vendor"
      ? "/vendor"
      : "/account/orders";

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ============================= */}
          {/* BRAND */}
          {/* ============================= */}

          <Link
            to={isStaff ? dashboardPath : "/"}
            className="flex items-baseline gap-1 shrink-0"
          >
            <span className="font-display text-2xl tracking-tight text-ink">
              Cosmo
            </span>

            <span className="font-display text-2xl italic text-berry-500">
              Store
            </span>
          </Link>

          {/* ============================= */}
          {/* DESKTOP NAVIGATION (storefront only) */}
          {/* ============================= */}

          {!isStaff && (
            <nav className="hidden md:flex items-center gap-7 text-[15px]">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `transition-colors hover:text-berry-500 ${
                      isActive
                        ? "text-berry-500"
                        : "text-ink/80"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          {isStaff && (
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-ink/50">
              {user.role === "admin" ? <LayoutDashboard size={15} /> : <Store size={15} />}
              {user.role === "admin" ? "Admin dashboard" : "Vendor dashboard"}
            </div>
          )}

          {/* ============================= */}
          {/* DESKTOP SEARCH (storefront only) */}
          {/* ============================= */}

          {!isStaff && (
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center flex-1 max-w-xs"
            >
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                />

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-white border border-ink/10 rounded-full pl-9 pr-3 py-2 text-sm focus:border-berry-400 outline-none"
                />
              </div>
            </form>
          )}

          {/* ============================= */}
          {/* RIGHT SIDE */}
          {/* ============================= */}

          <div className="flex items-center gap-4">

            {/* NOTIFICATIONS */}
            <NotificationBell />

            {/* CART (storefront only -- admins/vendors don't place orders) */}
            {!isStaff && (
              <Link
                to="/cart"
                className="relative text-ink/80 hover:text-berry-500 transition-colors"
              >
                <ShoppingBag size={22} />

                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-berry-500 text-white text-[10px] font-semibold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* ============================= */}
            {/* DESKTOP ACCOUNT */}
            {/* ============================= */}

            <div className="relative hidden sm:block">

              <button
                type="button"
                onClick={() =>
                  setAccountOpen((open) => !open)
                }
                className="flex items-center gap-1.5 text-ink/80 hover:text-berry-500 transition-colors"
              >
                <User size={22} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-ink/10 rounded-xl shadow-soft py-2 text-sm">

                  {user ? (
                    <>
                      {/* USER INFO */}
                      <div className="px-4 py-2 border-b border-ink/5">
                        <p className="font-medium text-ink truncate">
                          {user.full_name}
                        </p>

                        <p className="text-ink/50 text-xs capitalize">
                          {user.role}
                        </p>
                      </div>

                      {/* DASHBOARD / ORDERS */}
                      <Link
                        to={dashboardPath}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blush/60"
                      >
                        {user.role === "vendor" ? (
                          <Store size={15} />
                        ) : (
                          <LayoutDashboard size={15} />
                        )}

                        {user.role === "customer"
                          ? "My orders"
                          : "Dashboard"}
                      </Link>

                      {/* PROFILE */}
                      <Link
                        to="/account/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blush/60"
                      >
                        <User size={15} />

                        Profile
                      </Link>

                      {/* LOGOUT */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-blush/60 text-berry-600"
                      >
                        <LogOut size={15} />

                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      {/* LOGIN */}
                      <Link
                        to="/login"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 hover:bg-blush/60"
                      >
                        Log in
                      </Link>

                      {/* REGISTER */}
                      <Link
                        to="/register"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 hover:bg-blush/60"
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ============================= */}
            {/* MOBILE MENU BUTTON */}
            {/* ============================= */}

            <button
              type="button"
              className="md:hidden text-ink/80"
              onClick={() =>
                setMenuOpen((open) => !open)
              }
            >
              {menuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* MOBILE MENU */}
      {/* ============================= */}

      {menuOpen && (
        <div className="md:hidden border-t border-ink/10 bg-cream px-4 py-4 space-y-3">

          {/* MOBILE SEARCH (storefront only) */}
          {!isStaff && (
            <form
              onSubmit={handleSearch}
              className="relative"
            >
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
              />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white border border-ink/10 rounded-full pl-9 pr-3 py-2 text-sm outline-none"
              />
            </form>
          )}

          {/* NAV LINKS (storefront only) */}
          {!isStaff &&
            NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block py-1"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

          {/* ACCOUNT */}
          <div className="border-t border-ink/10 pt-3">

            {user ? (
              <>
                {/* DASHBOARD */}
                <Link
                  to={dashboardPath}
                  className="block py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {user.role === "customer"
                    ? "My orders"
                    : "Dashboard"}
                </Link>

                {/* PROFILE */}
                <Link
                  to="/account/profile"
                  className="block py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block py-1 text-berry-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                {/* LOGIN */}
                <Link
                  to="/login"
                  className="block py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>

                {/* REGISTER */}
                <Link
                  to="/register"
                  className="block py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
