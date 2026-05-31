import type { FC } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Icon, { type IconName } from './Icon';

type Tab = {
  path: string;
  label: string;
  icon: IconName;
};

const TABS: Tab[] = [
  { path: '/run', label: 'Corrida', icon: 'run' },
  { path: '/history', label: 'Historial', icon: 'history' },
  { path: '/leaderboard', label: 'Ranking', icon: 'trophy' },
  { path: '/profile', label: 'Perfil', icon: 'user' },
];

export const TabBar: FC = () => {
  const location = useLocation();
  const history = useHistory();

  return (
    <nav
      role="tablist"
      aria-label="Navegacion principal"
      className="fixed left-0 right-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2"
      style={{ background: 'linear-gradient(to top, var(--stride-bg-page) 60%, rgba(240,238,233,0))' }}
    >
      <div
        className="mx-auto flex items-center justify-around bg-white rounded-[26px]"
        style={{
          maxWidth: 520,
          boxShadow: 'var(--shadow-stride-lg)',
          padding: '6px 6px',
        }}
      >
        {TABS.map((tab) => {
          const active = location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              role="tab"
              aria-selected={active}
              aria-label={tab.label}
              onClick={() => {
                if (!active) {
                  history.push(tab.path);
                }
              }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-[20px] py-1.5 transition-colors"
              style={{
                background: active ? 'var(--stride-accent-tint)' : 'transparent',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                name={tab.icon}
                size={22}
                color={active ? 'var(--stride-accent)' : 'var(--stride-ink-3)'}
                strokeWidth={active ? 2.3 : 2}
              />
              <span
                className="font-body font-bold"
                style={{
                  fontSize: 10.5,
                  color: active ? 'var(--stride-accent)' : 'var(--stride-ink-3)',
                  letterSpacing: 0.2,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;
