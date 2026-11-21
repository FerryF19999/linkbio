import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import styles from "./ProfileShowcase.module.css";

const profiles = [
  {
    name: "NEMU AI",
    description: "Marketplace Indonesia",
    href: "/nemu-ai",
    photo: "/showcase-market.webp",
    logo: "/favicon.svg",
  },
  {
    name: "Cek Harga di Sini",
    description: "Estimasi harga barang dengan AI",
    href: "/cekhargadisini",
    photo: "/showcase-camera.webp",
    logo: "/cekhargadisini-logo.svg",
  },
];

export default function ProfileShowcase() {
  return (
    <section id="showcase" className={styles.section} aria-labelledby="showcase-title">
      <div className={styles.inner}>
        <h2 id="showcase-title">Lihat contoh profil.</h2>
        <div className={styles.gallery}>
          {profiles.map((profile) => (
            <Link href={profile.href} key={profile.href} className={styles.profile} aria-label={`Buka profil ${profile.name}`}>
              <div className={styles.poster}>
                <Image src={profile.photo} fill alt="" sizes="(max-width: 639px) 94vw, (max-width: 1480px) 45vw, 680px" />
              </div>
              <div className={styles.caption}>
                <span className={styles.logo}><Image src={profile.logo} width={26} height={26} alt="" /></span>
                <div className={styles.name}>
                  <h3>{profile.name}</h3>
                  <p>{profile.description}</p>
                </div>
                <span className={styles.arrow}><FiArrowUpRight aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
