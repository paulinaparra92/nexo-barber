import './SocialLinks.css'
import itcMonogram from '../../assets/itc-monogram.png'
import './SocialLinks.css'
import itcLogo from '../../assets/itc-logo.png'

function SocialLinks() {
    return (
        <main className="social-links-page">
            <section className="social-links-container">

                <header className="social-brand">
                    <img
                        src={itcMonogram}
                        alt=""
                        className="social-monogram"
                    />

                    <img
                        src={itcLogo}
                        alt="In The Cut Barber Studio"
                        className="social-wordmark"
                    />
                </header>

                <section className="social-intro">
                    <span className="social-eyebrow">MANTENTE CONECTADO</span>
                    <h2>Síguenos en redes</h2>
                    <p>
                        Conoce nuestro trabajo, novedades y contenido.
                    </p>
                </section>

                <div className="social-list">

                    <a
                        href="https://www.instagram.com/inthecutbarbershop4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-card"
                    >
                        <div>
                            <strong>Instagram</strong>
                            <span>@inthecutbarbershop4</span>
                        </div>
                        <span className="social-arrow">↗</span>
                    </a>

                    <a
                        href="https://www.facebook.com/profile.php?id=61589639795615"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-card"
                    >
                        <div>
                            <strong>Facebook</strong>
                            <span>In The Cut Barber Studio</span>
                        </div>
                        <span className="social-arrow">↗</span>
                    </a>

                    <a
                        href="https://www.tiktok.com/@inthecutbarbershop4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-card"
                    >
                        <div>
                            <strong>TikTok</strong>
                            <span>@inthecutbarbershop4</span>
                        </div>
                        <span className="social-arrow">↗</span>
                    </a>

                </div>

                <p className="social-cta-text">
  ¿Listo para tu próximo corte?
</p>

<a
  href="/"
  className="social-booking-button"
>
  Reservar una cita
</a>

                <footer className="social-footer">
                    POWERED BY NEXO
                </footer>

            </section>
        </main>
    )
}

export default SocialLinks