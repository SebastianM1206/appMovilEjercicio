import { useMemo, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';
import StrideButton from '../../../ui/components/Button';
import Field from '../../../ui/components/Field';
import Icon from '../../../ui/components/Icon';
import IconButton from '../../../ui/components/IconButton';

type AuthMode = 'signIn' | 'signUp';

const EMAIL_RX = /.+@.+\..+/;

const AuthScreen = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailOk = EMAIL_RX.test(email.trim());
  const passwordError =
    password.length > 0 && password.length < 6 ? 'Minimo 6 caracteres' : null;
  const emailError = email.length > 0 && !emailOk ? 'Email invalido' : null;
  const nameOk = displayName.trim().length > 1;

  const canSubmit = useMemo(() => {
    if (!emailOk || password.length < 6) return false;
    if (mode === 'signUp' && !nameOk) return false;
    return true;
  }, [emailOk, mode, nameOk, password.length]);

  const handleSubmit = async () => {
    // miso, esto es si es login o registro.
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signIn') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, displayName.trim());
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error de autenticacion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent
        scrollY
        style={{ '--background': 'var(--stride-bg)' } as React.CSSProperties}
      >
        <div className="min-h-full flex flex-col bg-white" style={{ color: 'var(--stride-ink)' }}>
          <div className="px-7 pt-12">
            <span
              className="grid place-items-center rounded-[13px]"
              style={{ width: 44, height: 44, background: 'var(--stride-accent)' }}
            >
              <Icon name="zap" size={26} color="#fff" strokeWidth={2.2} />
            </span>
            <h1
              className="font-display mt-5"
              style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.08, letterSpacing: -0.8 }}
            >
              {mode === 'signIn' ? 'Bienvenido de vuelta' : 'Creá tu cuenta'}
            </h1>
            <p
              className="font-body mt-2"
              style={{ fontSize: 15, color: 'var(--stride-ink-2)' }}
            >
              {mode === 'signIn'
                ? 'Seguí sumando kilómetros'
                : 'Empezá a registrar tus corridas hoy'}
            </p>
          </div>

          {/* Segmented */}

          <div
            className="mx-7 mt-6 flex rounded-[12px] p-1"
            style={{ background: 'var(--stride-bg-subtle)' }}
            role="tablist"
            aria-label="Selector de modo"
          >
            {([
              ['signIn', 'Iniciar sesión'],
              ['signUp', 'Registrarse'],
            ] as const).map(([k, l]) => {
              const active = mode === k;
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setMode(k);
                    setError(null);
                  }}
                  className="flex-1 h-10 rounded-[9px] font-body font-bold text-sm transition-all"
                  style={{
                    background: active ? '#fff' : 'transparent',
                    color: active ? 'var(--stride-ink)' : 'var(--stride-ink-3)',
                    boxShadow: active ? 'var(--shadow-stride)' : 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>

          <div className="px-7 pt-6 flex flex-col gap-4">
            {mode === 'signUp' && (
              <Field
                label="Nombre"
                value={displayName}
                onChangeValue={setDisplayName}
                placeholder="Ana Pérez"
                icon="user"
                ok={nameOk}
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              value={email}
              onChangeValue={setEmail}
              placeholder="vos@mail.com"
              icon="mail"
              type="email"
              autoComplete="email"
              inputMode="email"
              ok={emailOk}
              error={emailError}
            />
            <Field
              label="Contraseña"
              value={password}
              onChangeValue={setPassword}
              placeholder="••••••••"
              icon="lock"
              type={showPass ? 'text' : 'password'}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              error={passwordError}
              trailing={
                <IconButton
                  icon={showPass ? 'eyeOff' : 'eye'}
                  ariaLabel={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  size={32}
                  iconSize={19}
                  variant="subtle"
                  onClick={() => setShowPass((v) => !v)}
                />
              }
            />
            {mode === 'signIn' && (
              <button
                type="button"
                className="self-end font-body font-bold text-sm -mt-1"
                style={{ color: 'var(--stride-accent)' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>

          {error && (
            <div className="px-7 mt-4">
              <div
                className="rounded-[14px] px-4 py-3 font-body font-semibold"
                role="alert"
                style={{
                  background: 'var(--stride-danger-soft)',
                  color: 'var(--stride-danger)',
                  fontSize: 13.5,
                }}
              >
                {error}
              </div>
            </div>
          )}

          <div className="px-7 pt-6 pb-7 mt-auto">
            <StrideButton
              size="lg"
              full
              loading={submitting}
              disabled={!canSubmit || submitting}
              onClick={() => void handleSubmit()}
            >
              {mode === 'signIn' ? 'Iniciar sesión' : 'Crear cuenta'}
            </StrideButton>
            <p
              className="font-body text-center mt-3"
              style={{ fontSize: 12.5, color: 'var(--stride-ink-3)' }}
            >
              {mode === 'signIn'
                ? 'Tu corrida se guarda local aunque no haya señal.'
                : 'Al continuar aceptás términos y privacidad.'}
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthScreen;
