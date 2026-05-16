import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const LeaderboardScreen = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Ranking</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>Pantalla base para ranking semanal.</p>
    </IonContent>
  </IonPage>
);

export default LeaderboardScreen;
