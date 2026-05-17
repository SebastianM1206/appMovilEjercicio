import { useCallback, useState } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { getErrorMessage } from '../../shared/utils';

export type HapticsImpact = 'LIGHT' | 'MEDIUM' | 'HEAVY';
export type HapticsNotification = 'SUCCESS' | 'WARNING' | 'ERROR';

const impactMap: Record<HapticsImpact, ImpactStyle> = {
  LIGHT: ImpactStyle.Light,
  MEDIUM: ImpactStyle.Medium,
  HEAVY: ImpactStyle.Heavy,
};

const notificationMap: Record<HapticsNotification, NotificationType> = {
  SUCCESS: NotificationType.Success,
  WARNING: NotificationType.Warning,
  ERROR: NotificationType.Error,
};

export const useHaptics = () => {
  const [error, setError] = useState<string | null>(null);

  const impact = useCallback(async (style: HapticsImpact = 'MEDIUM') => {
    setError(null);

    try {
      await Haptics.impact({ style: impactMap[style] });
    } catch (hookError: unknown) {
      setError(getErrorMessage(hookError, 'No fue posible ejecutar el impacto haptico.'));
    }
  }, []);

  const notify = useCallback(async (type: HapticsNotification = 'SUCCESS') => {
    setError(null);

    try {
      await Haptics.notification({ type: notificationMap[type] });
    } catch (hookError: unknown) {
      setError(getErrorMessage(hookError, 'No fue posible ejecutar la notificacion haptica.'));
    }
  }, []);

  const vibrate = useCallback(async (duration = 300) => {
    setError(null);

    try {
      await Haptics.vibrate({ duration });
    } catch (hookError: unknown) {
      setError(getErrorMessage(hookError, 'No fue posible ejecutar la vibracion.'));
    }
  }, []);

  const selection = useCallback(async () => {
    setError(null);

    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (hookError: unknown) {
      setError(getErrorMessage(hookError, 'No fue posible ejecutar la seleccion haptica.'));
    }
  }, []);

  return {
    error,
    impact,
    notify,
    vibrate,
    selection,
  };
};
