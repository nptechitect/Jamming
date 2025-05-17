//config/musicServices.js
export const MusicServices = [
  {
    id: "tidal",
    name: "Tidal",
    authUri: "https://login.tidal.com/authorize",
    tokenUri: "https://login.tidal.com/authorize",
    clientId: import.meta.env.VITE_TIDAL_APP_ID,
    redirectUri: `${window.location.origin}/auth/callback`,
    scopes: [
      'user.read',
      'collection.read',
      'search.read',
      'playlists.write',
      'collection.write',
      'playlists.read',
      'recommendations.read'
    ],
    logo: 'https://auth.tidal.com/v1/oauth2/token'
  }
]