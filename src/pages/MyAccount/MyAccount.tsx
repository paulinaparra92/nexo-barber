import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './MyAccount.css'


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


    useEffect(() => {
        async function loadAvatar() {
            if (!barberId) return

            const { data, error } = await supabase
                .from('barbers')
                .select('avatar_url')
                .eq('id', barberId)
                .single()

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