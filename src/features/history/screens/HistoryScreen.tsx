import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const HistoryScreen = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Historial</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>Pantalla base para revisar corridas pasadas.</p>
    </IonContent>
  </IonPage>
);

export default HistoryScreen;
