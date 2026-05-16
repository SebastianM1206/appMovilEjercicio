export type NotificationPayload = {
  title: string;
  body: string;
};

export const scheduleNotification = async (payload: NotificationPayload): Promise<void> => {
  void payload;
};
