<template>
  <main class="login-screen">
    <section class="brand-panel" aria-label="Agro Farías Administración">
      <div class="brand-lockup">
        <span class="brand-monogram">AF</span>
        <div><strong>Agro Farías</strong><small>Administración</small></div>
      </div>
      <div class="brand-message">
        <p>Consola interna</p>
        <h1>Catálogo, clientes y cotizaciones en un solo lugar.</h1>
        <span>Acceso exclusivo para el equipo autorizado.</span>
      </div>
      <div class="field-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    </section>

    <section class="access-panel">
      <form class="login-form" @submit.prevent="$emit('login')">
        <div class="form-heading">
          <p>Acceso seguro</p>
          <h2>Iniciar sesión</h2>
          <span>Ingresa la contraseña administrativa para continuar.</span>
        </div>

        <label for="admin-password">Contraseña</label>
        <div class="password-field">
          <input
            id="admin-password"
            :value="password"
            @input="$emit('update:password', ($event.target as HTMLInputElement).value)"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            autofocus
            required
            placeholder="Tu contraseña"
          />
          <button type="button" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="showPassword = !showPassword">
            {{ showPassword ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>

        <p v-if="loginError" class="login-error" role="alert">{{ loginError }}</p>

        <button class="submit-button" type="submit" :disabled="loggingIn || !password">
          <span>{{ loggingIn ? 'Verificando acceso' : 'Entrar al panel' }}</span>
          <svg v-if="!loggingIn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <span v-else class="button-loader" aria-hidden="true"></span>
        </button>

        <div class="security-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          <span>Conexión cifrada y sesión privada de 8 horas.</span>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ password: string; loggingIn: boolean; loginError: string }>()
defineEmits<{ (e: 'update:password', value: string): void; (e: 'login'): void }>()
const showPassword = ref(false)
</script>

<style scoped>
.login-screen{min-height:100svh;display:grid;grid-template-columns:minmax(390px,.9fr) minmax(460px,1.1fr);background:#f6f7f3;color:#17251c;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.brand-panel{position:relative;min-height:100svh;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:46px clamp(38px,6vw,82px);background:#143323;color:#f2f7f2}.brand-lockup{display:flex;align-items:center;gap:13px;position:relative;z-index:2}.brand-monogram{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(255,255,255,.28);border-radius:12px;background:#1f4d35;font-size:12px;font-weight:800;letter-spacing:.08em}.brand-lockup strong,.brand-lockup small{display:block}.brand-lockup strong{font-size:15px}.brand-lockup small{margin-top:3px;color:#8fa795;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em}.brand-message{max-width:520px;position:relative;z-index:2;padding-bottom:6vh}.brand-message p{margin:0 0 17px;color:#80b18c;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.17em}.brand-message h1{margin:0;max-width:500px;color:#f2f7f2;font-size:clamp(33px,4.2vw,58px);line-height:1.04;letter-spacing:-.045em}.brand-message span{display:block;max-width:380px;margin-top:23px;color:#a9baad;font-size:14px;line-height:1.6}.field-lines{position:absolute;inset:auto -13% -10% 0;height:42%;opacity:.16;transform:rotate(-5deg)}.field-lines i{display:block;height:14%;margin-top:3%;border-top:1px solid #d8ecd9;border-radius:50%}.access-panel{display:grid;place-items:center;padding:42px}.login-form{width:min(100%,420px);animation:form-in .45s ease both}.form-heading{margin-bottom:38px}.form-heading p{margin:0 0 11px;color:#39714c;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.16em}.form-heading h2{margin:0;color:#17251c;font-size:34px;line-height:1.1;letter-spacing:-.035em}.form-heading span{display:block;margin-top:12px;color:#748078;font-size:13px;line-height:1.5}.login-form>label{display:block;margin-bottom:8px;color:#435148;font-size:12px;font-weight:700}.password-field{display:grid;grid-template-columns:1fr auto;align-items:center;border:1px solid #cbd4cc;border-radius:10px;background:#fff;transition:border-color .18s,box-shadow .18s}.password-field:focus-within{border-color:#4d8060;box-shadow:0 0 0 4px rgba(54,112,73,.1)}.password-field input{min-width:0;height:50px;padding:0 15px;border:0;outline:0;background:transparent;color:#17251c;font-size:14px}.password-field button{height:34px;margin-right:8px;padding:0 9px;border:0;border-radius:7px;background:#eef2ed;color:#506057;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;cursor:pointer}.login-error{margin:11px 0 0;padding:10px 12px;border-left:3px solid #b3443d;background:#f9ecea;color:#8c332e;font-size:12px}.submit-button{width:100%;height:50px;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:18px;border:0;border-radius:10px;background:#21633f;color:#fff;font-size:13px;font-weight:800;cursor:pointer;transition:background .18s,transform .18s}.submit-button:hover:not(:disabled){background:#174d30;transform:translateY(-1px)}.submit-button:disabled{background:#92a298;cursor:not-allowed}.submit-button svg{width:17px;height:17px}.button-loader{width:15px;height:15px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}.security-note{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:21px;color:#859087;font-size:11px}.security-note svg{width:15px;height:15px;color:#4f7059}
@media(max-width:820px){.login-screen{grid-template-columns:1fr}.brand-panel{min-height:240px;padding:28px 26px}.brand-message{padding:34px 0 4px}.brand-message h1{max-width:520px;font-size:clamp(27px,8vw,42px)}.brand-message span{display:none}.access-panel{padding:42px 24px 54px}.login-form{width:min(100%,460px)}}
@media(max-width:480px){.brand-panel{min-height:210px}.brand-message p{margin-bottom:10px}.brand-message h1{font-size:29px}.access-panel{place-items:start center;padding-top:34px}.form-heading{margin-bottom:28px}.form-heading h2{font-size:29px}}
@keyframes form-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
