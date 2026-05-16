import type { FC } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';

const Example: FC = () => {
  return (
    <IonCard className="mx-auto max-w-sm">
      <IonCardHeader>
        <IonCardTitle className="text-slate-900">Componente ejemplo</IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="space-y-3">
        <p className="text-sm text-slate-600">Bloque base para probar Tailwind en Ionic.</p>
        <div className="h-10 rounded-lg bg-blue-500"></div>
      </IonCardContent>
    </IonCard>
  );
};

export default Example;
