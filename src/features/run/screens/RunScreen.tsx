import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const RunScreen = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Corrida</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>Pantalla base para iniciar y pausar una corrida.</p>
    </IonContent>
  </IonPage>
);

export default RunScreen;
