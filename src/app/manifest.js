export default function manifest() {
  return {
    name: 'WorkTrack - Monev Kerja Harian',
    short_name: 'WorkTrack',
    description: 'Aplikasi pencatatan jurnal aktivitas kerja harian dan evaluasi performa.',
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
