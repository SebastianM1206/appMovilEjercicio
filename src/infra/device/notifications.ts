import { LocalNotifications } from '@capacitor/local-notifications';
import { getErrorMessage } from '../../shared/utils';

export type NotificationPayload = {
  title: string;
  body: string;
};

const MAX_ANDROID_NOTIFICATION_ID = 2_147_483_647;

const createNotificationId = (): number => {
  const generatedId = Math.floor(Date.now() % MAX_ANDROID_NOTIFICATION_ID);
  return generatedId > 0 ? generatedId : 1;
};

export const scheduleNotification = async (
  payload: NotificationPayload,
  delayInSeconds = 2,
  id?: number,
): Promise<number | null> => {
  try {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      const requested = await LocalNotifications.requestPermissions();
      if (requested.display !== 'granted') {
        return null;
      }
    }

    const safeId =
      typeof id === 'number' && Number.isInteger(id) && id > 0 && id <= MAX_ANDROID_NOTIFICATION_ID
        ? id
        : createNotificationId();

    const safeDelay = Number.isFinite(delayInSeconds) && delayInSeconds > 0 ? delayInSeconds : 2;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: safeId,
          title: payload.title,
          body: payload.body,
          schedule: {
            at: new Date(Date.now() + safeDelay * 1000),
            allowWhileIdle: true,
          },
          sound: 'default',
        },
      ],
    });

    return safeId;
  } catch (error: unknown) {
    console.error(getErrorMessage(error, 'Error scheduling notification'));
    return null;
  }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const status = await LocalNotifications.requestPermissions();
  return status.display === 'granted';
};
