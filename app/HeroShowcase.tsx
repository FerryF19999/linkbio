import Image from "next/image";
import { FiArrowUpRight, FiInstagram } from "react-icons/fi";
import styles from "./HeroShowcase.module.css";

export default function HeroShowcase() {
  return (
    <figure className={styles.showcase}>
      <Image
        className={styles.photo}
        src="/hero-studio-keramik.webp"
        alt="Perajin keramik di samping papan profil Rupa Tanah yang memuat koleksi keramik dan kelas studio."
        width={1254}
        height={1254}
        sizes="(max-width: 760px) 100vw, (max-width: 1500px) 50vw, 750px"
        preload
      />
      <div className={styles.board} aria-hidden="true">
        <div className={styles.wordmark}>Rupa<br /><i>Tanah</i></div>
        <span className={styles.handle}><FiInstagram />@rupatanah</span>
        <div className={styles.collection}>
          <span className={styles.productPhoto} />
          <span>Koleksi keramik <FiArrowUpRight /></span>
        </div>
        <div className={styles.studioLink}>Kelas studio <FiArrowUpRight /></div>
        <div className={styles.poweredBy}><i />NEMU Link Bio</div>
      </div>
      <figcaption className={styles.caption}>Contoh profil studio keramik</figcaption>
    </figure>
  );
}
