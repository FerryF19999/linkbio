"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiCheck, FiShoppingBag, FiShoppingCart } from "react-icons/fi";
import styles from "./landing.module.css";

const themes = [
  { id: "classic", name: "Klasik", color: "#e6e4ee" },
  { id: "forest", name: "Hutan", color: "#164f41" },
  { id: "midnight", name: "Malam", color: "#202024" },
] as const;

export default function ThemePreview() {
  const [selected, setSelected] = useState<(typeof themes)[number]["id"]>("classic");

  return (
    <section className={styles.themes} id="features" aria-labelledby="theme-heading">
      <div className={styles.themeCopy}>
        <h2 id="theme-heading">Pilih warna <br /><em>profilmu.</em></h2>
        <p>Coba tema di bawah untuk melihat tampilan tautan toko dan media sosialmu.</p>
        <fieldset className={styles.swatches}>
          <legend className="visually-hidden">Tema contoh profil</legend>
          {themes.map(({ id, name, color }) => (
            <label key={id}>
              <input type="radio" name="preview-theme" value={id} checked={selected === id} onChange={() => setSelected(id)} />
              <span className={styles.swatch} style={{ background: color }}>
                {selected === id && <FiCheck color={id === "classic" ? "#252031" : "#fff"} aria-hidden="true" />}
              </span>
              {name}
            </label>
          ))}
        </fieldset>
      </div>
      <div className={styles.demo} data-theme={selected} aria-label="Pratinjau tema">
        <div className={styles.sampleProfile}>
          <span className={styles.sampleAvatar}><Image alt="" src="/favicon.svg" width={34} height={34} /></span>
          <strong>@nemu.ai</strong><span>Marketplace buatan Indonesia</span>
          <div className={styles.sampleRows}>
            <a href="https://shop.nemu-ai.com/"><FiShoppingBag aria-hidden="true" />Belanja di NEMU<FiArrowUpRight aria-hidden="true" /></a>
            <a href="https://seller.nemu-ai.com/register"><FiShoppingCart aria-hidden="true" />Daftar jadi seller<FiArrowUpRight aria-hidden="true" /></a>
          </div>
          <Link href="/nemu-ai">Buka profil asli <FiArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
