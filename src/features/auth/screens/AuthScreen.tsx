import { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'signIn' | 'signUp';

const AuthScreen = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModeChange = (value: string) => {
    setMode(value as AuthMode);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signIn') {
        await signInWithEmail(email, password);
        return;
      }
      await signUpWithEmail(email, password, displayName);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error de autenticacion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Acceso</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSegment value={mode} onIonChange={(event) => handleModeChange(String(event.detail.value))}>
          <IonSegmentButton value="signIn">
            <IonLabel>Iniciar sesion</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="signUp">
            <IonLabel>Registrarse</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <div className="mt-6 space-y-2">
          {mode === 'signUp' && (
            <IonItem>
              <IonLabel position="stacked">Nombre</IonLabel>
              <IonInput
                value={displayName}
                onIonInput={(event) => setDisplayName(event.detail.value ?? '')}
                autocomplete="name"
                aria-label="Nombre para mostrar"
              />
            </IonItem>
          )}

          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonInput={(event) => setEmail(event.detail.value ?? '')}
              autocomplete="email"
              aria-label="Correo electronico"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Contrasena</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonInput={(event) => setPassword(event.detail.value ?? '')}
              autocomplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              aria-label="Contrasena"
            />
          </IonItem>
        </div>

        {error && (
          <IonText color="danger">
            <p className="mt-4" role="alert">
              {error}
            </p>
          </IonText>
        )}

        <IonButton
          expand="block"
          className="mt-6"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          aria-label={mode === 'signIn' ? 'Iniciar sesion' : 'Crear cuenta'}
        >
          {isSubmitting ? 'Procesando...' : mode === 'signIn' ? 'Entrar' : 'Crear cuenta'}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AuthScreen;
