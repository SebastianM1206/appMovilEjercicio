import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useRef, useState, type ChangeEvent } from 'react';
import { useRunMedia } from '../../run/hooks/useRunMedia';
import { useSyncQueue } from '../../sync/hooks/useSyncQueue';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const HistoryScreen = () => {
  const { isSyncing, pendingCount, lastError } = useSyncQueue();
  const { isUploadingPhoto, lastUpload, error: runMediaError, uploadRunPhoto } = useRunMedia();
  const [runId, setRunId] = useState('');
  const [runIdError, setRunIdError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const normalizedRunId = runId.trim();
  const isValidRunId = UUID_V4_REGEX.test(normalizedRunId);
  const statusLabel = isSyncing
    ? 'Sincronizando...'
    : lastError
      ? 'Error de sincronizacion'
      : pendingCount > 0
        ? `Pendiente de sincronizacion (${pendingCount})`
        : 'Sincronizado';

  const handleSelectPhoto = () => {
    if (!isValidRunId) {
      setRunIdError('Ingresa un Run ID UUID v4 valido antes de seleccionar una foto.');
      return;
    }

    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isValidRunId) {
      return;
    }

    await uploadRunPhoto(normalizedRunId, file);
    event.target.value = '';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Historial</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="mb-4 rounded-lg border border-gray-200 p-3" role="status" aria-label="Estado de sincronizacion">
          <p>{statusLabel}</p>
          {lastError && (
            <IonText color="danger">
              <p role="alert">{lastError}</p>
            </IonText>
          )}
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Subir foto de corrida</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonInput
              label="Run ID"
              labelPlacement="stacked"
              placeholder="UUID de la corrida"
              value={runId}
              onIonInput={(event) => {
                const nextValue = event.detail.value ?? '';
                setRunId(nextValue);
                if (nextValue.trim().length === 0 || UUID_V4_REGEX.test(nextValue.trim())) {
                  setRunIdError(undefined);
                } else {
                  setRunIdError('Formato invalido. Usa UUID v4 (ej. 550e8400-e29b-41d4-a716-446655440000).');
                }
              }}
            />

            {runIdError && (
              <IonText color="warning">
                <p role="status">{runIdError}</p>
              </IonText>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => void handlePhotoSelected(event)}
            />

            <IonButton
              className="mt-3"
              onClick={handleSelectPhoto}
              disabled={isUploadingPhoto || !isValidRunId}
            >
              {isUploadingPhoto ? 'Subiendo foto...' : 'Seleccionar foto'}
            </IonButton>

            {runMediaError && (
              <IonText color="danger">
                <p role="alert">{runMediaError}</p>
              </IonText>
            )}

            {lastUpload && (
              <IonText color="success">
                <p>
                  Foto subida. photoCount actual: {lastUpload.photoCount}. Path: {lastUpload.path}
                </p>
              </IonText>
            )}
          </IonCardContent>
        </IonCard>

        <p>Pantalla base para revisar corridas pasadas.</p>
      </IonContent>
    </IonPage>
  );
};

export default HistoryScreen;
