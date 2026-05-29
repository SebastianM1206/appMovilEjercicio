# Firebase — configuracion M0

## 1. Crear proyecto Firebase (Spark/gratis)

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear proyecto
3. Habilitar **Authentication** → Email/Password
4. Crear **Realtime Database** (modo locked, luego deploy rules)
5. Habilitar **Storage**

## 2. Variables de entorno

Copiar `.env.example` a `.env` y completar con las credenciales del proyecto:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 3. Deploy reglas (M0)

Instalar Firebase CLI si no lo tienes:

```bash
npm install -g firebase-tools
firebase login
```

Desde `appMovilEjercicio/`:

```bash
firebase use --add
firebase deploy --only database
firebase deploy --only storage
```

## 4. Verificacion M1

Datos de prueba:

```
email: test@example.com
password: TestPass123
displayName: Test Runner
```

Tras registro/login, verificar en RTDB: `/users/{uid}/public`
