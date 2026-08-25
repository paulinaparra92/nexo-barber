const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const {
      to,
      barberName,
      clientName,
      service,
      appointmentDate,
      appointmentTime,
      whatsapp,
    } = await req.json()

    if (!to) {
      return new Response(
        JSON.stringify({
          error: 'No se encontró correo del barbero',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const res = await fetch(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Nexo <avisos@nexobarber.app>',
          to: [to],
          subject: `Nueva cita - ${clientName}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px">
              <h2>Nueva cita en Nexo 💈</h2>

              <p>
                Hola <strong>${barberName}</strong>,
                tienes una nueva cita.
              </p>

              <p><strong>Cliente:</strong> ${clientName}</p>
              <p><strong>Servicio:</strong> ${service}</p>
              <p><strong>Fecha:</strong> ${appointmentDate}</p>
              <p><strong>Hora:</strong> ${appointmentTime}</p>
              <p><strong>WhatsApp:</strong> ${whatsapp}</p>

              <hr />

              <p style="color:#666;font-size:13px">
                Reserva realizada desde Nexo.
              </p>
            </div>
          `,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error('Error de Resend:', data)

      return new Response(
        JSON.stringify(data),
        {
          status: res.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)

    return new Response(
      JSON.stringify({
        error: 'Error al enviar correo',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})