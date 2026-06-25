import { ref, onMounted } from 'vue'

const H = { 'Content-Type': 'application/json' }

interface UseAdminAuthOptions {
  /**
   * Comprueba la sesión actual; resuelve `true` si es válida. Se llama al
   * montar y es responsable de la carga inicial de datos (efecto colateral).
   */
  probe: () => Promise<boolean>
  /** Se ejecuta solo tras un login correcto (no en el montaje). */
  onAuthenticated?: () => void
}

/**
 * Maneja el ciclo de autenticación del panel admin: comprobación inicial de
 * sesión, login y logout. No conoce los datos del panel; la carga inicial la
 * hace `probe` y la post-login la delega vía `onAuthenticated`.
 */
export function useAdminAuth(opts: UseAdminAuthOptions) {
  const checking = ref(true)
  const authed = ref(false)
  const password = ref('')
  const loggingIn = ref(false)
  const loginError = ref('')

  onMounted(async () => {
    try {
      authed.value = await opts.probe()
    } catch {
      authed.value = false
    } finally {
      checking.value = false
    }
  })

  async function login() {
    if (!password.value) return
    loggingIn.value = true
    loginError.value = ''
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ password: password.value }),
      })
      if (r.ok) {
        password.value = ''
        authed.value = true
        opts.onAuthenticated?.()
      } else {
        loginError.value = 'Contraseña incorrecta'
      }
    } catch {
      loginError.value = 'Error de conexión'
    } finally {
      loggingIn.value = false
    }
  }

  async function logout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST', headers: H })
    } catch {
      /* noop: igual cerramos sesión en el cliente */
    }
    authed.value = false
  }

  return { checking, authed, password, loggingIn, loginError, login, logout }
}
