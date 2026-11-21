"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import styles from "./LandingHeader.module.css";

const sections = [
  { href: "#showcase", label: "Contoh profil" },
  { href: "#features", label: "Fitur" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingHeader({ isAdmin }: { isAdmin: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [menuOpen]);

  return (
    <header
      className={styles.header}
      ref={header}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className={styles.bar}>
        <Link className={styles.brand} href="/" aria-label="NEMU Link Bio, beranda">
          <Image src="/favicon.svg" alt="" width={30} height={30} />
          <strong>NEMU</strong><span>Link Bio</span>
        </Link>
        <nav className={styles.desktopNav} aria-label="Navigasi utama">
          {sections.map(({ href, label }) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className={styles.actions}>
          <Link className={styles.signup} href={isAdmin ? "/app" : "#waitlist"} onClick={() => setMenuOpen(false)}>
            {isAdmin ? "Dashboard" : "Daftar"}
          </Link>
          <button
            className={styles.toggle}
            ref={menuButton}
            type="button"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-controls={menuId}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
        <nav className={styles.mobileNav} aria-label="Navigasi utama" id={menuId} hidden={!menuOpen}>
          {sections.map(({ href, label }) => (
            <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
