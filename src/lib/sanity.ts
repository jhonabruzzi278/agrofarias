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
