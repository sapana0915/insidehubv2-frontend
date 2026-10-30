import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Masthead } from "./Masthead";
import { Footer } from "./Footer";
import { Spinner } from "../ui/Decor";

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Masthead />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex-1"
      >
        <Suspense fallback={<Spinner label="Unfolding the map…" />}>
          <Outlet />
        </Suspense>
      </motion.main>
      <Footer />
    </div>
  );
}
