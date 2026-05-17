import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useMemo } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { getIsoWeekPeriodKey } from '../../../shared/utils';

const LeaderboardScreen = () => {
  const periodKey = useMemo(() => getIsoWeekPeriodKey(Date.now()), []);
  const { rows, myEntry, isLoading } = useLeaderboard(periodKey);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ranking semanal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Semana {periodKey}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isLoading && <div>Cargando ranking...</div>}
            {!isLoading && rows.length === 0 && <div>Sin datos para esta semana.</div>}
            {!isLoading &&
              rows.map((row, index) => (
                <div key={row.id}>
                  {index + 1}. {row.displayName} - {Math.round(row.distanceM)} m ({row.runCount}{' '}
                  {row.runCount === 1 ? 'carrera' : 'carreras'})
                </div>
              ))}
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Tu posicion</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {myEntry ? (
              <div>
                {myEntry.displayName} - {Math.round(myEntry.distanceM)} m ({myEntry.runCount}{' '}
                {myEntry.runCount === 1 ? 'carrera' : 'carreras'})
              </div>
            ) : (
              <div>Aun no tienes datos esta semana.</div>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default LeaderboardScreen;
