import { useCallback, useEffect, useState } from 'react';
import type { PluginListenerHandle } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getErrorMessage } from '../shared/utils';

const MAX_ANDROID_NOTIFICATION_ID = 2_147_483_647;

const createNotificationId = (): number => {
  const generatedId = Math.floor(Date.now() % MAX_ANDROID_NOTIFICATION_ID);
  return generatedId > 0 ? generatedId : 1;
};

type PermissionState = Awaited<ReturnType<typeof LocalNotifications.checkPermissions>>;

type LocalNotificationSchema = Awaited<
  ReturnType<typeof LocalNotifications.getDeliveredNotifications>
>['notifications'][number];

export const useLocalNotifications = () => {
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [lastNotification, setLastNotification] = useState<LocalNotificationSchema | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setError(null);

    try {
      const currentPermission = await LocalNotifications.checkPermissions();

      if (currentPermission.display === 'granted') {
        setPermission(currentPermission);
        return currentPermission;
      }

      const requestedPermission = await LocalNotifications.requestPermissions();
      setPermission(requestedPermission);

      if (requestedPermission.display !== 'granted') {
        throw new Error('Permiso de notificaciones locales denegado.');
      }

      return requestedPermission;
    } catch (hookError: unknown) {
      setError(
        getErrorMessage(hookError, 'No fue posible solicitar permisos de notificaciones locales.'),
      );
      return null;
    }
  }, []);

  const schedule = useCallback(
    async (title: string, body: string, delayInSeconds = 2, id?: number) => {
      setError(null);

      try {
        const permissionResult = await requestPermission();

        if (!permissionResult || permissionResult.display !== 'granted') {
          return null;
        }

        const safeId =
          typeof id === 'number' &&
          Number.isInteger(id) &&
          id > 0 &&
          id <= MAX_ANDROID_NOTIFICATION_ID
            ? id
            : createNotificationId();

        const safeDelayInSeconds =
          Number.isFinite(delayInSeconds) && delayInSeconds > 0 ? delayInSeconds : 2;

        await LocalNotifications.schedule({
          notifications: [
            {
              id: safeId,
              title,
              body,
              schedule: {
                at: new Date(Date.now() + safeDelayInSeconds * 1000),
                allowWhileIdle: true,
              },
            },
          ],
        });

        return safeId;
      } catch (hookError: unknown) {
        setError(getErrorMessage(hookError, 'No fue posible programar la notificacion local.'));
        return null;
      }
    },
    [requestPermission],
  );

  useEffect(() => {
    let receivedListener: PluginListenerHandle | undefined;

    const setupListener = async () => {
      receivedListener = await LocalNotifications.addListener(
        'localNotificationReceived',
        (notification) => {
          setLastNotification(notification);
        },
      );
    };

    void setupListener();

    return () => {
      void receivedListener?.remove();
    };
  }, []);

  return {
    permission,
    lastNotification,
    error,
    requestPermission,
    schedule,
  };
};
