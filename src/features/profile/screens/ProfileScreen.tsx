import {
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useRef, type ChangeEvent } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { profile, isLoading, error, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAvatarButton = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadAvatar(file);
    event.target.value = '';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {profile.avatarUrl && (
          <IonImg
            src={profile.avatarUrl}
            alt="Avatar de usuario"
            className="mb-4 h-24 w-24 overflow-hidden rounded-full object-cover"
          />
        )}
        <IonItem lines="none">
          <IonLabel>
            <h2>{profile.displayName}</h2>
            <p>{profile.email}</p>
          </IonLabel>
        </IonItem>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => void handleAvatarSelected(event)}
        />

        <IonButton
          expand="block"
          className="mt-4"
          onClick={handleAvatarButton}
          disabled={isLoading}
          aria-label="Subir avatar"
        >
          Subir avatar
        </IonButton>

        {error && (
          <IonText color="danger">
            <p role="alert">{error}</p>
          </IonText>
        )}

        <IonButton
          expand="block"
          color="medium"
          className="mt-6"
          onClick={() => void handleSignOut()}
          aria-label="Cerrar sesion"
        >
          Cerrar sesion
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProfileScreen;
