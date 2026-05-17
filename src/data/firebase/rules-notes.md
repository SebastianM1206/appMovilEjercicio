# reglas locales (documentacion)

Este archivo es solo notas. Las reglas reales viven en Firebase Console.

## RTDB (Realtime Database)

### Estructura esperada

- /users/{uid}/public
- /runs/{uid}/{runId}/summary
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

## Storage

### Rutas esperadas

- routes/{uid}/{runId}.json.gz
- photos/{uid}/{runId}/{photoId}.jpg
- avatars/{uid}.jpg

### Reglas base

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /routes/{uid}/{file} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /photos/{uid}/{runId}/{file} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /avatars/{uid}.jpg {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
