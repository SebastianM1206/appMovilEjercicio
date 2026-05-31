# Firebase — configuracion M0

## 1. Crear proyecto Firebase (Spark/gratis)

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear proyecto
3. Habilitar **Authentication** → Email/Password
4. Crear **Realtime Database** (modo locked, luego deploy rules)
5. (Opcional) Firestore si planeas usarlo mas adelante

## 2. Variables de entorno

Completar `.env` con las credenciales del proyecto:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Cloudinary (unsigned upload) para fotos y avatar:

```
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_CLOUDINARY_AVATAR_FOLDER=stride/avatars
VITE_CLOUDINARY_RUN_PHOTO_FOLDER=stride/run-photos
```

Nota: el preset debe estar en modo **Unsigned**.

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
```

## 4. Verificacion M1

Datos de prueba:

```
email: test@example.com
password: TestPass123
displayName: Test Runner
```

Tras registro/login, verificar en RTDB: `/users/{uid}/public`
