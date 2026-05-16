import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const AuthScreen = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Autenticacion</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>Pantalla base para acceso y registro.</p>
    </IonContent>
  </IonPage>
);

export default AuthScreen;
