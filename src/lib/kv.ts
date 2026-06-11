import { Redis } from '@upstash/redis'

/**
 * Cliente Upstash Redis compartido (init perezoso). Si faltan las env, devuelve
 * null y quien lo use debe degradar con gracia.
 */
let redis: Redis | null = null
let initialized = false

export function getRedis(): Redis | null {
  if (initialized) return redis
  initialized = true
  const url = import.meta.env.UPSTASH_REDIS_REST_URL as string | undefined
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN as string | undefined
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

// Hash interno: orderId -> estado de seguimiento (NO toca WooCommerce).
export const ESTADOS_KEY = 'cotizador:estados'
