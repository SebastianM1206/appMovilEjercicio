import type { FC, ReactNode } from 'react';
import { IonContent, IonPage } from '@ionic/react';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
  <IonPage>
    <IonContent className="ion-padding">{children}</IonContent>
  </IonPage>
);

export default AppLayout;
