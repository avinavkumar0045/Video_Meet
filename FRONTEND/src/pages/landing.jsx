import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/landing.module.css';

export default function LandingPage() {
    const router = useNavigate();

    return (
        <div className={styles.container}>
            {/* Abstract Background Glows */}
            <div className={styles.heroBackground}>
                <div className={styles.glowBlue}></div>
                <div className={styles.glowPurple}></div>
            </div>

            {/* Navbar */}
            <nav className={styles.nav}>
                <div className={styles.logo} onClick={() => router("/")} style={{cursor: "pointer"}}>
                    <span style={{ color: '#FF9933' }}>Mann </span>
                    <span style={{ color: '#FFFFFF' }}>Ki </span>
                    <span style={{ color: '#138808' }}>Baat</span>
                </div>

                <div className={styles.navActions}>
                    <button className={styles.btnText} onClick={() => router("/auth")}>Sign In</button>
                    <button className="btn-secondary" onClick={() => router("/auth")}>Register</button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className={styles.mainContent}>
                <h1 className={styles.heroTitle}>
                    <span className={styles.logoWhite}>Meaningful </span>
                    <span className="text-gradient">Conversations<br/></span>
                    <span className={styles.logoWhite}>Bring Us Closer</span>
                </h1>
                
                <p className={styles.heroSubtitle}>
                    High-quality, secure and easy-to-use<br/>
                    video meetings for everyone.
                </p>

                <div className={styles.ctaGroup}>
                    <button className="btn-primary" onClick={() => router("/auth")}>
                        Get Started →
                    </button>
                    <button className="btn-secondary" onClick={() => router("/asdw2s")}>
                        Join as Guest
                    </button>
                </div>
            </main>
        </div>
    );
}
