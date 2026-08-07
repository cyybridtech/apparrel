import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/ui";
import { eur, formatDate } from "@/lib/format";
import type { OrderWithItems } from "@/lib/types";
import { IconArrow, IconBag, IconRefresh } from "@/components/icons";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError(true);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-14 sm:px-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.24em] text-flame uppercase">
              Order history
            </p>
            <h1 className="mt-2 font-display text-5xl tracking-wide uppercase sm:text-6xl">
              Your orders
            </h1>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 border border-line px-4 py-2.5 text-xs font-bold tracking-[0.16em] uppercase transition-colors hover:border-volt hover:text-volt"
          >
            <IconRefresh width={15} height={15} />
            Refresh
          </button>
        </div>
      </Reveal>

      <div className="mt-10">
        {orders === null ? (
          <div className="space-y-5">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse border border-line bg-ink-2 p-6">
                <div className="h-5 w-48 bg-ink-3" />
                <div className="mt-4 h-16 bg-ink-3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="border border-flame bg-flame/10 px-5 py-4 text-sm font-semibold text-flame">
            Could not reach the server. Hit refresh and try again.
          </div>
        ) : orders.length === 0 ? (
          <div className="grid place-items-center border border-dashed border-line px-6 py-24 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center border border-dashed border-line text-dust">
                <IconBag width={28} height={28} />
              </span>
              <h2 className="mt-5 font-display text-3xl uppercase">
                No orders yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-dust">
                When you grab a pair off the wall, it lands here with a number,
                a status and everything you paid.
              </p>
              <Link
                to="/#wall"
                className="mt-7 inline-flex items-center gap-2.5 bg-volt px-6 py-3.5 font-display text-lg tracking-wide text-ink uppercase transition-all hover:-translate-y-0.5"
              >
                Shop the wall <IconArrow width={17} height={17} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <Reveal key={order.id} delay={i * 80}>
                <article className="border border-line bg-ink-2 transition-all hover:border-dust hover:shadow-[8px_8px_0_rgba(0,0,0,0.4)]">
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-xl tracking-[0.08em] text-volt">
                        {order.orderNo}
                      </h2>
                      <span className="border border-volt bg-volt/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-volt uppercase">
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] tracking-[0.14em] text-dust uppercase">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="font-display text-xl">
                        {eur(order.totalCents)}
                      </p>
                    </div>
                  </header>

                  <ul className="divide-y divide-line">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden border border-line bg-ink-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold tracking-[0.2em] text-dust uppercase">
                            {item.brand}
                          </p>
                          <p className="truncate font-display text-base tracking-wide uppercase">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-dust">
                            {item.colorway} · EU {item.eu} · Qty {item.qty}
                          </p>
                        </div>
                        <p className="font-display text-base text-bone">
                          {eur(item.unitPriceCents * item.qty)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3.5 text-xs text-dust">
                    <p>
                      Ships to{" "}
                      <span className="font-semibold text-bone">
                        {order.address}, {order.zip} {order.city}
                      </span>
                    </p>
                    <p>
                      Subtotal {eur(order.subtotalCents)} · Shipping{" "}
                      {order.shippingCents === 0
                        ? "Free"
                        : eur(order.shippingCents)}{" "}
                      · <span className="font-bold text-volt">Total {eur(order.totalCents)}</span>
                    </p>
                  </footer>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
