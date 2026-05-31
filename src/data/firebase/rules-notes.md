# reglas locales (documentacion)

Este archivo es solo notas. Las reglas reales viven en Firebase Console.

## RTDB (Realtime Database)

### Estructura esperada

- /users/{uid}/public
- /runs/{uid}/{runId}/summary
- /runs/{uid}/{runId}/route
- /runs/{uid}/{runId}/photos/{photoId}
- /counted/{uid}/{runId}
- /agg/{periodKey}/{uid}

### Reglas base

```json
{
  "rules": {
    "users": {
      "$uid": {
        "public": {
          ".read": true,
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    },
    "runs": {
      "$uid": {
        "$runId": {
          "summary": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && auth.uid === $uid",
            ".validate": "newData.hasChildren(['startedAt', 'durationS', 'distanceM'])"
          },
          "route": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && auth.uid === $uid"
          },
          "photos": {
            "$photoId": {
              ".read": "auth != null && auth.uid === $uid",
              ".write": "auth != null && auth.uid === $uid"
            }
          }
        }
      }
    },
    "counted": {
      "$uid": {
        "$runId": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid && !data.exists()"
        }
      }
    },
    "agg": {
      "$periodKey": {
        "$uid": {
          ".read": true,
          ".write": "auth != null && auth.uid === $uid",
          ".validate": "newData.hasChildren(['distanceM', 'runCount'])"
        }
      }
    },
    "agg": {
      "$periodKey": {
        ".indexOn": ["distanceM", "score"]
      }
    }
  }
}
```

### Validaciones sugeridas

- distanceM > 0 y < 100000
- durationS > 0
- avgPaceSPerKm entre 180 y 1200 (3 a 20 min/km)

## Cloudinary

Las imagenes (avatars y fotos de corridas) viven en Cloudinary.
En RTDB solo guardamos metadata y URLs.
