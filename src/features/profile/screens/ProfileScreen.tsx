import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const ProfileScreen = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Perfil</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>Pantalla base para datos del usuario.</p>
    </IonContent>
  </IonPage>
);

export default ProfileScreen;
