export default function manifest() {
  return {
    name: 'InternTrack - Monev Magang',
    short_name: 'InternTrack',
    description: 'Aplikasi pencatatan jurnal harian dan evaluasi magang.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
