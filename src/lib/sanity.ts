import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const sanityClient = createClient({
  projectId: 'zrpklrq5',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

export async function fetchBanners() {
  const query = `*[_type == "banner" && activo == true]|order(orden asc){
    _id, titulo, subtitulo, textoBoton, urlBoton, orden,
    "imagenUrl": imagen.asset->url
  }`
  return sanityClient.fetch<Array<{
    _id: string; titulo: string; subtitulo: string; textoBoton: string;
    urlBoton: string; orden: number; imagenUrl: string;
  }>>(query)
}

export async function fetchCategoriasDestacadas() {
  const query = `*[_type == "categoriaDestacada" && activo == true]|order(orden asc){
    _id, nombre, "slug": slug.current, descripcion, woocommerceId, orden,
    "iconoUrl": icono.asset->url
  }`
  return sanityClient.fetch<Array<{
    _id: string; nombre: string; slug: string; descripcion: string;
    woocommerceId: number; orden: number; iconoUrl: string;
  }>>(query)
}

export async function fetchProductosDestacados() {
  const query = `*[_type == "productoDestacado" && destacado == true]|order(orden asc){
    _id, nombre, descripcion, woocommerceId, categoria, orden,
    "imagenUrl": imagen.asset->url,
    "galeriaUrl": galeria[].asset->url
  }`
  return sanityClient.fetch<Array<{
    _id: string; nombre: string; descripcion: string; woocommerceId: number;
    categoria: string; orden: number; imagenUrl: string; galeriaUrl: string[];
  }>>(query)
}

export async function fetchPromoBanners() {
  const query = `*[_type == "promoBanner" && activo == true]|order(orden asc)[0...3]{
    _id, titulo, subtitulo, precio, textoBoton, urlBoton, orden,
    "imagenUrl": imagen.asset->url
  }`
  return sanityClient.fetch<Array<{
    _id: string; titulo: string; subtitulo: string; precio: string;
    textoBoton: string; urlBoton: string; orden: number; imagenUrl: string;
  }>>(query)
}

export async function fetchCTA() {
  const query = `*[_type == "cta" && activo == true][0]{
    _id, titulo, subtitulo, textoBoton, urlBoton,
    "imagenFondoUrl": imagenFondo.asset->url
  }`
  return sanityClient.fetch<{
    _id: string; titulo: string; subtitulo: string; textoBoton: string;
    urlBoton: string; imagenFondoUrl: string;
  } | null>(query)
}

export async function fetchContacto() {
  const query = `*[_type == "contacto"][0]{
    _id, empresa, direccion, telefono, email, horarioAtencion,
    facebook, instagram, linkedin, whatsapp
  }`
  return sanityClient.fetch<{
    _id: string; empresa: string; direccion: string; telefono: string;
    email: string; horarioAtencion: string;
    facebook?: string; instagram?: string; linkedin?: string; whatsapp?: string;
  } | null>(query)
}

export async function fetchMenu() {
  const query = `*[_type == "menu"]{
    _id, nombre, items
  }`
  return sanityClient.fetch<Array<{
    _id: string; nombre: string; items: Array<{ label: string; url: string; nuevaVentana: boolean }>;
  }>>(query)
}
