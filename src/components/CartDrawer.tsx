import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Product, CartItem } from "../types";
import { motion } from "motion/react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  lang: "fr" | "ar";
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  lang,
}: CartDrawerProps) {
  const isRTL = lang === "ar";
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 ${isRTL ? "left-0" : "right-0"} flex max-w-full`}>
        <motion.div
          initial={{ x: isRTL ? "-100%" : "100%" }}
          animate={{ x: 0 }}
          exit={{ x: isRTL ? "-100%" : "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white dark:bg-[#1a1a1b] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-brand-navy dark:text-white">
                {lang === "fr" ? "Mon Panier" : "سلة التسوق"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={() => cartItems.forEach((i) => onRemoveItem(i.product.id))}
                  className="text-xs font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title={lang === "fr" ? "Vider tout le panier" : "تفريغ السلة بالكامل"}
                >
                  {lang === "fr" ? "Vider le panier" : "تفريغ السلة"}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-500 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Cart Items Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="h-16 w-16 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-300 dark:text-zinc-700 mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  {lang === "fr" ? "Votre panier est vide" : "سلتك فارغة تمامًا"}
                </h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-xs">
                  {lang === "fr"
                    ? "Découvrez nos superbes produits et ajoutez-les au panier !"
                    : "اكتشف منتجاتنا المميزة وقم بإضافتها هنا للطلب الآن !"}
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 rounded-full bg-brand-green px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-green-dark transition-all cursor-pointer"
                >
                  {lang === "fr" ? "Continuer mes achats" : "مواصلة التسوق"}
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const title = lang === "fr" ? item.product.titleFR : item.product.titleAR;
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    {/* Item Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800">
                      <img
                        src={item.product.image}
                        alt={title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-brand-navy dark:text-zinc-100 line-clamp-2 leading-tight">
                            {title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                            title={lang === "fr" ? "Supprimer de la commande" : "حذف المنتج من السلة"}
                            id={`remove-cart-item-${item.product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                          {lang === "fr"
                            ? item.product.category.toUpperCase()
                            : item.product.category}
                        </p>
                      </div>

                      {/* Quantity & Pricing */}
                      <div className="flex justify-between items-center mt-2">
                        {/* Adjusters */}
                        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-40"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-brand-navy dark:text-zinc-200 min-w-[16px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs sm:text-sm font-black text-brand-green">
                          {(item.product.price * item.quantity).toLocaleString()} {lang === "fr" ? "DA" : "دج"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 dark:border-zinc-800 px-6 py-5 bg-gray-50/50 dark:bg-zinc-900/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                  {lang === "fr" ? "Sous-total :" : "المجموع الفرعي :"}
                </span>
                <span className="text-lg font-black text-brand-navy dark:text-white">
                  {subtotal.toLocaleString()} {lang === "fr" ? "DA" : "دج"}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mb-4">
                {lang === "fr"
                  ? "TVA incluse. Frais d'expédition calculés lors du paiement."
                  : "شامل الرسوم. يتم حساب تكلفة الشحن عند إتمام الطلب."}
              </p>
              <button
                onClick={onProceedToCheckout}
                className="w-full rounded-full bg-brand-green hover:bg-brand-green-dark py-3 text-xs sm:text-sm font-black text-white shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                {lang === "fr" ? "Passer à la Caisse" : "إتمام الطلب الآن"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
