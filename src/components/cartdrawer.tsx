import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useStore, type CheckoutDetails } from "@/lib/store";
import { eur } from "@/lib/format";
import {
  IconArrow,
  IconBag,
  IconCheck,
  IconMinus,
  IconPlus,
  IconTrash,
  IconX,
} from "@/components/icons";

const FREE_SHIP = 150000;  // GHS 1,500
const SHIPPING  = 2500;    // GHS 25

const EMPTY: CheckoutDetails = {
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
};

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    setLineQty,
    removeLine,
    placeOrder,
    cartCount,
  } = useStore();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState<CheckoutDetails>(EMPTY);
  const [errors, setErrors] = useState<Partial<CheckoutDetails>>({});
  const [placing, setPlacing] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => cart.reduce((n, l) => n + l.product.priceCents * l.qty, 0),
    [cart]
  );
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP ? 0 : SHIPPING;

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
      if (cart.length > 0) setOrderNo(null);
    } else {
      document.body.style.overflow = "";
      setCheckout(false);
      setServerError(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, cart.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCartOpen]);

  const validate = (): boolean => {
    const e: Partial<CheckoutDetails> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.zip.trim()) e.zip = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setPlacing(true);
    setServerError(null);
    const res = await placeOrder(form);
    setPlacing(false);
    if (res.ok) {
      setOrderNo(res.order.orderNo);
      setForm(EMPTY);
      setCheckout(false);
    } else {
      setServerError(res.error);
    }
  };

  const field = (
    key: keyof CheckoutDetails,
    label: string,
    placeholder: string,
    type = "text",
    span = false
  ) => (
    <label className={`block ${span ? "col-span-2" : ""}`}>
      <span className="mb-1 block text-[10px] font-bold tracking-[0.2em] text-dust uppercase">
        {label}
      </span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => {
          setForm((f) => ({ ...f, [key]: e.target.value }));
          setErrors((er) => ({ ...er, [key]: undefined }));
        }}
        placeholder={placeholder}
        className={`w-full border bg-ink px-3 py-2.5 text-sm transition-colors placeholder:text-dust/50 focus:outline-none ${
          errors[key] ? "border-flame" : "border-line focus:border-volt"
        }`}
      />
      {errors[key] && (
        <span className="mt-1 block text-[10px] font-bold tracking-wider text-flame uppercase">
          {errors[key]}
        </span>
      )}
    </label>
  );

  return (
    <div
      className={`fixed inset-0 z-[70] ${cartOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!cartOpen}
    >
      <button
        className={`absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setCartOpen(false)}
        aria-label="Close bag"
      />
      <aside
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-line bg-ink-2 transition-transform duration-300 ease-out ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping bag"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-[#1b2438] px-5 py-4 bg-[#0e131f]">
          <div>
            <h2 className="font-display text-xl tracking-wide uppercase text-white">
              Your Bag <span className="text-[#00f0ff]">({cartCount})</span>
            </h2>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-0.5">KICKS GHANA</p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[#1b2438] text-gray-400 transition-colors hover:border-[#ff3b5c] hover:text-[#ff3b5c]"
            aria-label="Close"
          >
            <IconX width={17} height={17} />
          </button>
        </div>

        {/* success state */}
        {orderNo ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="animate-pop grid h-20 w-20 place-items-center rounded-full bg-volt text-ink">
              <IconCheck width={38} height={38} strokeWidth={2.6} />
            </span>
            <h3 className="font-display text-3xl uppercase">Order locked in</h3>
            <p className="text-sm text-dust">
              Your pair is being laced up. Order number
            </p>
            <p className="border border-volt bg-ink px-4 py-2 font-display text-xl tracking-[0.12em] text-volt">
              {orderNo}
            </p>
            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
              <Link
                to="/orders"
                onClick={() => setCartOpen(false)}
                className="inline-flex items-center justify-center gap-2 bg-volt px-5 py-3 font-display text-base tracking-wide text-ink uppercase transition-transform hover:-translate-y-0.5"
              >
                View orders <IconArrow width={16} height={16} />
              </Link>
              <button
                onClick={() => {
                  setOrderNo(null);
                  setCartOpen(false);
                }}
                className="border border-line px-5 py-3 text-xs font-bold tracking-[0.16em] uppercase transition-colors hover:border-bone"
              >
                Keep shopping
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="text-6xl">👟</div>
            <div>
              <h3 className="font-display text-2xl uppercase text-white">Bag's Empty</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-[220px]">
                Nothing here yet. The wall is fully stocked with heat.
              </p>
            </div>
            <a
              href="/#wall"
              onClick={() => setCartOpen(false)}
              className="btn-cyan inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display text-base tracking-wide text-black uppercase transition-transform hover:-translate-y-0.5"
            >
              Shop the Wall <IconArrow width={16} height={16} />
            </a>
          </div>
        ) : (
          <>
            {/* Free shipping meter */}
            <div className="border-b border-[#1b2438] px-5 py-4 bg-[#0e131f]">
              {shipping === 0 ? (
                <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#10b981] uppercase">
                  <IconCheck width={14} height={14} strokeWidth={2.6} /> 🎉 Free shipping unlocked!
                </p>
              ) : (
                <p className="text-xs font-semibold tracking-wide text-gray-400">
                  Add <span className="text-[#00f0ff] font-bold">{eur(FREE_SHIP - subtotal)}</span> more for free shipping
                </p>
              )}
              <div className="shipping-bar mt-2">
                <div
                  className="shipping-bar-fill"
                  style={{ width: `${Math.min(100, (subtotal / FREE_SHIP) * 100)}%` }}
                />
              </div>
            </div>

            {/* lines */}
            <div className="flex-1 divide-y divide-line overflow-y-auto">
              {cart.map((line) => (
                <div key={line.id} className="flex gap-3.5 p-4">
                  <div
                    className="relative h-20 w-20 shrink-0 overflow-hidden"
                    style={{ backgroundColor: line.product.accent }}
                  >
                    <img
                      src={line.product.image}
                      alt={line.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                          {line.product.brand}
                        </p>
                        <p className="truncate font-display text-sm font-bold text-white uppercase">
                          {line.product.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {(line as any).sizeLabel ?? `EU ${line.eu}`} · {line.product.colorway}
                        </p>
                      </div>
                      <button
                        onClick={() => removeLine(line.id)}
                        className="text-dust transition-colors hover:text-flame"
                        aria-label={`Remove ${line.product.name}`}
                      >
                        <IconTrash width={16} height={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-line">
                        <button
                          onClick={() => setLineQty(line.id, line.qty - 1)}
                          className="grid h-7 w-7 place-items-center text-dust hover:bg-ink-3 hover:text-bone"
                          aria-label="Decrease"
                        >
                          <IconMinus width={12} height={12} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">
                          {line.qty}
                        </span>
                        <button
                          onClick={() =>
                            setLineQty(line.id, Math.min(line.stock, line.qty + 1))
                          }
                          disabled={line.qty >= line.stock}
                          className="grid h-7 w-7 place-items-center text-dust hover:bg-ink-3 hover:text-bone disabled:opacity-30"
                          aria-label="Increase"
                        >
                          <IconPlus width={12} height={12} />
                        </button>
                      </div>
                      <p className="font-display text-base text-volt">
                        {eur(line.product.priceCents * line.qty)}
                      </p>
                    </div>
                    {line.qty >= line.stock && (
                      <p className="mt-1 text-[10px] font-bold tracking-wider text-flame uppercase">
                        Max stock reached
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* footer / checkout */}
            <div className="border-t border-line bg-ink p-5">
              {serverError && (
                <p className="mb-3 border border-flame bg-flame/10 px-3 py-2 text-xs font-bold tracking-wider text-flame uppercase">
                  {serverError}
                </p>
              )}

              {checkout ? (
                <form onSubmit={submit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {field("name", "Full name", "Ada Kicks", "text", true)}
                    {field("email", "Email", "ada@loud.sh", "email", true)}
                    {field("address", "Street address", "42 Heel Street")}
                    <div className="grid grid-cols-2 gap-3">
                      {field("city", "City", "Berlin")}
                      {field("zip", "ZIP", "10115")}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
                    <span className="text-dust">Total</span>
                    <span className="font-display text-2xl text-volt">
                      {eur(subtotal + shipping)}
                    </span>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCheckout(false)}
                      className="border border-line px-4 py-3 text-xs font-bold tracking-[0.14em] uppercase transition-colors hover:border-bone"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={placing}
                      className="flex flex-1 items-center justify-center gap-2 bg-volt px-4 py-3 font-display text-lg tracking-wide text-ink uppercase transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {placing ? "Placing…" : `Place order · ${eur(subtotal + shipping)}`}
                    </button>
                  </div>
                  <p className="text-center text-[10px] tracking-wider text-dust uppercase">
                    Demo checkout — no card required
                  </p>
                </form>
              ) : (
                <>
                  <div className="space-y-1.5 text-sm">
                    <p className="flex justify-between text-dust">
                      <span>Subtotal</span>
                      <span className="font-semibold text-bone">{eur(subtotal)}</span>
                    </p>
                    <p className="flex justify-between text-dust">
                      <span>Shipping</span>
                      <span className="font-semibold text-bone">
                        {shipping === 0 ? "Free" : eur(shipping)}
                      </span>
                    </p>
                    <p className="flex justify-between border-t border-line pt-2 text-base">
                      <span className="font-bold tracking-[0.14em] uppercase">Total</span>
                      <span className="font-display text-2xl text-volt">
                        {eur(subtotal + shipping)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setCheckout(true)}
                    className="group mt-4 flex w-full items-center justify-center gap-3 btn-cyan rounded-2xl px-5 py-4 font-display text-xl tracking-wide uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,240,255,0.3)] active:translate-y-0"
                  >
                    Checkout
                    <IconArrow
                      width={19}
                      height={19}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
