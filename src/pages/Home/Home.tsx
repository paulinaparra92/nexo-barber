function Home() {
  return (
    <main
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '64px 24px',
        lineHeight: 1.7,
      }}
    >
      <section style={{ marginBottom: '48px' }}>
        <h1>Nexo</h1>

        <p>
          Nexo es una plataforma de gestión para barberías que facilita la
          administración de citas, servicios, barberos y disponibilidad desde
          un solo lugar.
        </p>

        <p>
          También permite ofrecer a los clientes un proceso de reserva simple,
          rápido y sin necesidad de instalar una aplicación.
        </p>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2>Gestión sencilla para barberías</h2>

        <p>
          Nexo está diseñado para ayudar a las barberías a organizar su agenda,
          administrar sus servicios y mantener el control de sus citas de forma
          clara y práctica.
        </p>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2>Integración con Google Calendar</h2>

        <p>
          Los barberos pueden conectar voluntariamente su cuenta de Google
          Calendar para sincronizar sus citas y mantener su agenda actualizada.
        </p>
      </section>

      <section>
        <h2>Información legal</h2>

        <p>
          <a href="/privacy">Política de Privacidad</a>
        </p>

        <p>
          <a href="/terms">Condiciones del Servicio</a>
        </p>
      </section>
    </main>
  )
}

export default Home