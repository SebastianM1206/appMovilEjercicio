import type { FC } from 'react';
import { IonText } from '@ionic/react';

type EmptyStateProps = {
  title: string;
  description?: string;
};

const EmptyState: FC<EmptyStateProps> = ({ title, description }) => (
  <div>
    <h2>{title}</h2>
    {description ? (
      <IonText color="medium">
        <p>{description}</p>
      </IonText>
    ) : null}
  </div>
);

export default EmptyState;
