import type { FC } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import type { RunRecord } from '../data/runRepo';

type RunSummaryCardProps = {
  run: RunRecord;
};

const RunSummaryCard: FC<RunSummaryCardProps> = ({ run }) => (
  <IonCard>
    <IonCardHeader>
      <IonCardTitle>Sesion {run.id}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <div>Distancia: {Math.round(run.distanceMeters)} m</div>
      <div>Duracion: {Math.round(run.durationSec)} s</div>
    </IonCardContent>
  </IonCard>
);

export default RunSummaryCard;
