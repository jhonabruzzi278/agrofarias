/**
 * Fichas técnicas por slug de producto (PDF).
 *
 * Es un FALLBACK mientras se cargan las fichas en WooCommerce. La prioridad de
 * resolución es: campo del producto en WooCommerce (ACF `ficha_tecnica` o custom
 * field `ficha_tecnica`) > este mapa. Cuando todas las fichas estén en
 * WooCommerce, este archivo puede quedar vacío.
 */
export const FICHAS_TECNICAS: Record<string, string> = {
  'absoluto-70-wp-x-250-g': 'https://api.agrofarias.cl/wp-content/uploads/2026/06/absoluto_70_wp_07-02-2019.pdf',
}
