import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useMemo } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { getIsoWeekPeriodKey } from '../../../shared/utils';

const formatDistanceKm = (distanceM: number): string => {
  return (distanceM / 1000).toFixed(2);
};

const LeaderboardScreen = () => {
  const periodKey = useMemo(() => getIsoWeekPeriodKey(Date.now()), []);
  const { rows, myEntry, isLoading, error } = useLeaderboard(periodKey);

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
            {isLoading && (
              <div role="status" aria-label="Cargando ranking">
                Cargando ranking...
              </div>
            )}
            {error && (
              <IonText color="danger">
                <p role="alert">{error}</p>
              </IonText>
            )}
            {!isLoading && !error && rows.length === 0 && (
              <div>Sin datos para esta semana.</div>
            )}
            {!isLoading &&
              !error &&
              rows.map((row, index) => (
                <div key={row.id} className="py-2">
                  {index + 1}. {row.displayName} — {formatDistanceKm(row.distanceM)} km (
                  {row.runCount} {row.runCount === 1 ? 'carrera' : 'carreras'})
                </div>
              ))}
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Tu semana</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isLoading && <div>Cargando tu resumen...</div>}
            {!isLoading && myEntry && (
              <div>
                {myEntry.displayName} — {formatDistanceKm(myEntry.distanceM)} km ({myEntry.runCount}{' '}
                {myEntry.runCount === 1 ? 'carrera' : 'carreras'})
              </div>
            )}
            {!isLoading && !myEntry && !error && (
              <div>Aun no tienes datos esta semana.</div>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default LeaderboardScreen;
