import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useAuth } from '../../auth/hooks/useAuth';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem lines="none">
          <IonLabel>
            <h2>{user?.displayName ?? 'Usuario'}</h2>
            <p>{user?.email ?? 'Sin email'}</p>
          </IonLabel>
        </IonItem>

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
