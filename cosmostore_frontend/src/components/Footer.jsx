import { Link } from "react-router-dom";
import { AtSign, Share2, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-2xl text-cream mb-3">
            Cosmo<span className="italic text-berry-200">Store</span>
          </p>
          <p className="text-sm text-cream/60 max-w-xs">
            A marketplace of independent cosmetic boutiques across Pakistan, screened for safe,
            secure checkout on every order.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Instagram" className="hover:text-berry-200"><AtSign size={18} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-berry-200"><Share2 size={18} /></a>
            <a href="#" aria-label="WhatsApp" className="hover:text-berry-200"><MessageCircle size={18} /></a>
          </div>
        </div>

        <div>
          <p className="text-cream text-sm font-medium mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-cream/60">
            <li><Link to="/shop" className="hover:text-cream">All products</Link></li>
            <li><Link to="/stores" className="hover:text-cream">Boutiques</Link></li>
            <li><Link to="/shop?sort=newest" className="hover:text-cream">New arrivals</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-cream text-sm font-medium mb-3">Sell with us</p>
          <ul className="space-y-2 text-sm text-cream/60">
            <li><Link to="/register" className="hover:text-cream">Become a vendor</Link></li>
            <li><Link to="/vendor" className="hover:text-cream">Vendor dashboard</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-cream text-sm font-medium mb-3">Payments accepted</p>
          <ul className="space-y-2 text-sm text-cream/60">
            <li>Easypaisa</li>
            <li>JazzCash</li>
            <li>Credit / Debit Card</li>
            <li>Cash on delivery</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} CosmoStore. Every order is screened by our fraud protection system.
      </div>
    </footer>
  );
}
