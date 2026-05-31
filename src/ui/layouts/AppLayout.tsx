import type { FC, ReactNode } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import TabBar from '../components/TabBar';

type AppLayoutProps = {
  children: ReactNode;
  hideTabBar?: boolean;
  scroll?: boolean;
  contentClassName?: string;
};

const AppLayout: FC<AppLayoutProps> = ({
  children,
  hideTabBar,
  scroll = true,
  contentClassName,
}) => (
  <IonPage>
    <IonContent
      scrollY={scroll}
      className={contentClassName}
      style={{ '--background': 'var(--stride-bg-page)' } as React.CSSProperties}
    >
      <div
        className="min-h-full font-body"
        style={{
          background: 'var(--stride-bg-page)',
          color: 'var(--stride-ink)',
          paddingBottom: hideTabBar ? 0 : 'calc(env(safe-area-inset-bottom) + 96px)',
        }}
      >
        {children}
      </div>
    </IonContent>
    {!hideTabBar && <TabBar />}
  </IonPage>
);

export default AppLayout;
