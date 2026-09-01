import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './MyAccount.css'
import { getBarberHours } from '../../services/barberHoursService'


type BarberHour = {
    id: string
    weekday: number
    is_open: boolean
    open_time: string | null
    last_appointment_time: string | null
}

type MyAccountProps = {
    onBack: () => void
    barberName: string
    barberId: string | null
    onAvatarUpdated?: (url: string) => void
}

function MyAccount({
    onBack,
    barberName,
    barberId,
    onAvatarUpdated,
}: MyAccountProps) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState('')
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [barberHours, setBarberHours] = useState<BarberHour[]>([])
    const [loadingHours, setLoadingHours] = useState(false)
    const [connectingGoogle, setConnectingGoogle] = useState(false)
    const [googleCalendarConnected, setGoogleCalendarConnected] =
        useState(false)

    const [loadingGoogleCalendar, setLoadingGoogleCalendar] =
        useState(false)



    useEffect(() => {
        async function loadAvatar() {
            if (!barberId) return

            const { data, error } = await supabase
                .from('barbers')
                .select('avatar_url')
                .eq('id', barberId)
                .maybeSingle()

            if (error) {
                console.error(
                    'Error al cargar avatar:',
                    error
                )
                return
            }

            if (data?.avatar_url) {
                setAvatarUrl(data.avatar_url)
            }
        }

        loadAvatar()
    }, [barberId])

    useEffect(() => {
        async function loadMyAccountData() {
            if (!barberId) return

            setLoadingHours(true)

            const hours = await getBarberHours(barberId)

            setBarberHours(hours)
            setLoadingHours(false)

            await loadGoogleCalendarStatus()
        }

        loadMyAccountData()
    }, [barberId])


    useEffect(() => {
        const params = new URLSearchParams(
            window.location.search
        )

        if (params.get('google_calendar') !== 'connected') {
            return
        }

        setMessage(
            'Google Calendar conectado correctamente.'
        )

        params.delete('google_calendar')

        const cleanUrl =
            window.location.pathname +
            (params.toString()
                ? `?${params.toString()}`
                : '')

        window.history.replaceState(
            {},
            '',
            cleanUrl
        )
    }, [])

    async function handleChangePassword() {
        setMessage('')
        setError('')

        if (newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.')
            return
        }

        setSaving(true)

        const { error: updateError } =
            await supabase.auth.updateUser({
                password: newPassword,
            })

        setSaving(false)

        if (updateError) {
            console.error(
                'Error al cambiar contraseña:',
                updateError
            )

            setError(
                'No pudimos actualizar tu contraseña. Intenta nuevamente.'
            )
            return
        }

        setNewPassword('')
        setConfirmPassword('')
        setMessage('Contraseña actualizada correctamente.')
    }

    async function handleAvatarChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0]

        if (!file) return

        setError('')
        setMessage('')

        if (!file.type.startsWith('image/')) {
            setError('Selecciona una imagen válida.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no puede pesar más de 5 MB.')
            return
        }

        setUploadingAvatar(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            setUploadingAvatar(false)
            setError('No pudimos identificar tu sesión.')
            return
        }

        const fileExtension =
            file.name.split('.').pop()?.toLowerCase() || 'jpg'

        const filePath =
            `${user.id}/avatar.${fileExtension}`

        const { error: uploadError } =
            await supabase.storage
                .from('barber-avatars')
                .upload(filePath, file, {
                    upsert: true,
                })

        if (uploadError) {
            console.error(
                'Error al subir avatar:',
                uploadError
            )

            setUploadingAvatar(false)
            setError('No pudimos subir la imagen.')
            return
        }

        const { data } =
            supabase.storage
                .from('barber-avatars')
                .getPublicUrl(filePath)

        const publicUrl = data.publicUrl

        if (!barberId) {
            setUploadingAvatar(false)
            setError('No pudimos identificar tu perfil de barbero.')
            return
        }

        const { error: updateError } = await supabase
            .from('barbers')
            .update({
                avatar_url: publicUrl,
            })
            .eq('id', barberId)

        if (updateError) {
            console.error(
                'Error al guardar avatar del barbero:',
                updateError
            )

            setUploadingAvatar(false)
            setError(
                'La imagen se subió, pero no pudimos guardarla en tu perfil.'
            )
            return
        }

        const displayUrl = `${publicUrl}?t=${Date.now()}`

        setAvatarUrl(displayUrl)
        onAvatarUpdated?.(displayUrl)
        setUploadingAvatar(false)
        setMessage('Foto actualizada correctamente.')
    }


    async function handleConnectGoogleCalendar() {
        setError('')
        setMessage('')
        setConnectingGoogle(true)

        const { data, error: functionError } =
            await supabase.functions.invoke(
                'google-calendar-connect'
            )

        if (functionError || !data?.authorizationUrl) {
            console.error(
                'Error al conectar Google Calendar:',
                functionError
            )

            setConnectingGoogle(false)
            setError(
                'No pudimos iniciar la conexión con Google Calendar.'
            )
            return
        }

        window.location.href = data.authorizationUrl
    }


    async function loadGoogleCalendarStatus() {
        if (!barberId) return

        setLoadingGoogleCalendar(true)

        const { data, error } =
            await supabase.functions.invoke(
                'google-calendar-status'
            )

        setLoadingGoogleCalendar(false)

        if (error) {
            console.error(
                'Error al cargar estado de Google Calendar:',
                error
            )
            return
        }

        setGoogleCalendarConnected(
            data?.connected === true
        )
    }



    return (
        <main className="my-account-page">

            <button
                type="button"
                className="my-account-back"
                onClick={onBack}
            >
                ← Volver a la agenda
            </button>

            <header className="my-account-header">
                <span>Tu perfil y configuración</span>
                <h1>Mi cuenta</h1>
            </header>


            <section className="my-account-profile-card">
                <div className="my-account-avatar">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={barberName}
                        />
                    ) : (
                        barberName.charAt(0).toUpperCase()
                    )}
                </div>

                <div className="my-account-profile-info">
                    <strong>{barberName}</strong>
                    <span>Barbero</span>
                </div>
                <label className="avatar-upload-button">
                    {uploadingAvatar
                        ? 'Subiendo...'
                        : 'Cambiar foto'}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                    />
                </label>
            </section>


            {barberId && (
                <section className="my-account-card">
                    <h2>Disponibilidad</h2>

                    <p className="my-account-description">
                        Este es tu horario semanal configurado en Nexo.
                    </p>

                    {loadingHours ? (
                        <p className="my-account-description">
                            Cargando horarios...
                        </p>
                    ) : barberHours.length === 0 ? (
                        <p className="my-account-description">
                            No hay un horario semanal configurado.
                        </p>
                    ) : (
                        <div className="availability-list">
                            {barberHours.map((day) => (
                                <div
                                    key={day.weekday}
                                    className="availability-row"
                                >
                                    <span>
                                        {[
                                            'Domingo',
                                            'Lunes',
                                            'Martes',
                                            'Miércoles',
                                            'Jueves',
                                            'Viernes',
                                            'Sábado',
                                        ][day.weekday]}
                                    </span>

                                    <strong>
                                        {day.is_open
                                            ? `${day.open_time} - ${day.last_appointment_time}`
                                            : 'Descanso'}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {barberId && (
                <section className="my-account-card">
                    <h2>Google Calendar</h2>

                    {loadingGoogleCalendar ? (
                        <p className="my-account-description">
                            Verificando conexión...
                        </p>
                    ) : googleCalendarConnected ? (
                        <>
                            <p className="my-account-description">
                                ✓ Google Calendar conectado
                            </p>

                            <p className="my-account-description">
                                Tus nuevas citas de Nexo se agregarán
                                automáticamente a tu calendario.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="my-account-description">
                                Conecta tu calendario para recibir automáticamente
                                tus citas de Nexo.
                            </p>

                            <button
                                type="button"
                                className="my-account-save"
                                onClick={handleConnectGoogleCalendar}
                                disabled={connectingGoogle}
                            >
                                {connectingGoogle
                                    ? 'Conectando...'
                                    : 'Conectar Google Calendar'}
                            </button>
                        </>
                    )}
                </section>
            )}




            <section className="my-account-card">
                <h2>Seguridad</h2>

                <p className="my-account-description">
                    Actualiza la contraseña que utilizas para ingresar a Nexo.
                </p>

                <div className="my-account-field">
                    <label>Nueva contraseña</label>

                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(e.target.value)
                        }
                        placeholder="Mínimo 8 caracteres"
                    />
                </div>

                <div className="my-account-field">
                    <label>Confirmar contraseña</label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        placeholder="Repite tu contraseña"
                    />
                </div>

                {error && (
                    <p className="my-account-error">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="my-account-success">
                        {message}
                    </p>
                )}

                <button
                    type="button"
                    className="my-account-save"
                    onClick={handleChangePassword}
                    disabled={saving}
                >
                    {saving
                        ? 'Actualizando...'
                        : 'Cambiar contraseña'}
                </button>
            </section>

        </main>
    )
}

export default MyAccount