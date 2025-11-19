import { useLayoutEffect, useState, useRef } from "react";
import ProductCard from "../common/ProductCard";

const WishlistGrid = ({
  products,
  loading,
  currentPage,
  hasActiveFilters,
  onClearFilters,
}) => {
  const [displayed, setDisplayed] = useState(products || []);
  const [removingIds, setRemovingIds] = useState(new Set());

  // Map of id -> DOM element refs used for FLIP animation
  const itemRefs = useRef(new Map());
  // snapshot of first rects before removals (for FLIP)
  const firstRectsRef = useRef(new Map());
  // increment to trigger flip effect after displayed updates
  const flipVersion = useRef(0);
  // per-removal timers so multiple quick removals don't cancel each other
  const pendingTimers = useRef(new Map());
  const batchTimer = useRef(null);
  // track current page to immediately swap pages without exit animations
  const lastPageRef = useRef(currentPage);

  useLayoutEffect(() => {
    const prevIds = new Set(displayed.map((p) => p._id));
    const newIds = new Set((products || []).map((p) => p._id));

    const removals = [...prevIds].filter((id) => !newIds.has(id));
    const additions = (products || []).filter((p) => !prevIds.has(p._id));

    if (removals.length === 0) {
      // no removals; just set displayed to products (handles additions and initial load)
      if (additions.length > 0 || displayed.length === 0) {
        setDisplayed(products || []);
      }
      return;
    }

    const ANIM_MS = 320;

    // If the page changed since last render, immediately update displayed and clear animations
    if (lastPageRef.current !== currentPage) {
      lastPageRef.current = currentPage;
      pendingTimers.current.forEach((v) => clearTimeout(v));
      pendingTimers.current.clear();
      setRemovingIds(new Set());
      setDisplayed(products || []);
      return;
    }

    // Batch removals that occur at once into a single FLIP pass to avoid races
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
      batchTimer.current = null;
    }

    const removalsSet = new Set(removals);

    // capture first rects snapshot for FLIP for the current set
    firstRectsRef.current = new Map();
    displayed.forEach((p) => {
      const el = itemRefs.current.get(p._id);
      if (el) firstRectsRef.current.set(p._id, el.getBoundingClientRect());
    });

    // mark these ids as exiting (triggers exit animation)
    setRemovingIds((prev) => {
      const next = new Set(prev);
      removals.forEach((id) => next.add(id));
      return next;
    });

    batchTimer.current = setTimeout(() => {
      // remove removed ids and append additions from products
      setDisplayed((prev) => {
        const filteredPrev = prev.filter((p) => !removalsSet.has(p._id));
        const ids = new Set(filteredPrev.map((p) => p._id));
        (products || []).forEach((p) => {
          if (!ids.has(p._id)) filteredPrev.push(p);
        });
        return filteredPrev;
      });

      // bump flipVersion so a separate useLayoutEffect runs synchronously after DOM commit
      flipVersion.current += 1;

      // unmark removing ids after we queued the DOM update
      setTimeout(() => {
        setRemovingIds((prev) => {
          const next = new Set(prev);
          removals.forEach((id) => next.delete(id));
          return next;
        });
      }, 0);

      batchTimer.current = null;
    }, ANIM_MS);

    // apply additions immediately if there are any and no removals
    if (removals.length === 0 && additions.length > 0) {
      setDisplayed(products || []);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // cleanup on unmount: clear any pending timers
  useLayoutEffect(() => {
    const timers = pendingTimers;
    return () => {
      timers.current.forEach((v) => clearTimeout(v));
      timers.current.clear();
    };
  }, []);

  // After `displayed` updates, run FLIP inversion using the previously-captured first rects.
  useLayoutEffect(() => {
    const firstRects = firstRectsRef.current;
    if (!firstRects || firstRects.size === 0) return;

    const ANIM_MS = 320;

    const newDisplayedIds = new Set(displayed.map((p) => p._id));
    const remainingIds = [...firstRects.keys()].filter((id) =>
      newDisplayedIds.has(id)
    );

    remainingIds.forEach((id) => {
      const el = itemRefs.current.get(id);
      const first = firstRects.get(id);
      if (!el || !first) return;
      const last = el.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (dx === 0 && dy === 0) return;

      try {
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      } catch {
        return;
      }
      // force reflow
      el.getBoundingClientRect();

      try {
        el.style.transition = `transform ${ANIM_MS}ms cubic-bezier(.2,.8,.2,1)`;
        el.style.transform = "";
      } catch {
        // ignore
      }

      setTimeout(() => {
        if (el) {
          try {
            el.style.transition = "";
            el.style.transform = "";
          } catch {
            // ignore
          }
        }
      }, ANIM_MS + 20);
    });

    // clear captured rects
    firstRectsRef.current = new Map();
  }, [displayed]);
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-sm h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  // If there are no products in props and nothing displayed (no pending removals), show empty
  if (products.length === 0 && displayed.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="flex items-center justify-center min-h-[300px] py-12">
          <img
            src="/assets/EmptyWishlist.PNG"
            alt="Empty Wishlist"
            className="w-56 h-56 md:w-80 md:h-80 object-contain animate-slide-in"
          />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl text-main mb-3">
          Your wishlist is empty!
        </h3>
        <p className="text-gray text-base md:text-lg mb-6 font-light">
          Hoping you'll find something you like soon.
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-2 bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium hover:cursor-pointer delay-200"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {displayed.map((product) => (
          <div
            key={product._id}
            ref={(el) => {
              if (el) itemRefs.current.set(product._id, el);
              else itemRefs.current.delete(product._id);
            }}
            className={`transform will-change-transform transition-all duration-300 ${
              removingIds.has(product._id)
                ? "opacity-0 scale-95 -translate-y-3"
                : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
};

export default WishlistGrid;
