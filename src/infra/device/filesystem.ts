import { useCallback, useState } from 'react';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { getErrorMessage } from '../../shared/utils';

const DEFAULT_FILE_NAME = 'sensor-note.txt';

const isMissingFileMessage = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('does not exist') ||
    normalized.includes('not found') ||
    normalized.includes('no such file') ||
    normalized.includes('no existe')
  );
};

export const useFilesystem = () => {
  const [fileName, setFileName] = useState(DEFAULT_FILE_NAME);
  const [content, setContent] = useState('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const writeTextFile = useCallback(
    async (text: string, targetFileName = fileName) => {
      setLoading(true);
      setError(null);

      try {
        await Filesystem.writeFile({
          path: targetFileName,
          data: text,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
          recursive: true,
        });

        const uriResult = await Filesystem.getUri({
          path: targetFileName,
          directory: Directory.Data,
        });

        setFileName(targetFileName);
        setContent(text);
        setFileUri(uriResult.uri);
        return uriResult.uri;
      } catch (hookError: unknown) {
        const message = getErrorMessage(hookError, 'No fue posible escribir el archivo.');
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fileName],
  );

  const readTextFile = useCallback(
    async (targetFileName = fileName) => {
      setLoading(true);
      setError(null);

      try {
        const result = await Filesystem.readFile({
          path: targetFileName,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });

        const parsedData =
          typeof result.data === 'string' ? result.data : JSON.stringify(result.data);

        const uriResult = await Filesystem.getUri({
          path: targetFileName,
          directory: Directory.Data,
        });

        setFileName(targetFileName);
        setContent(parsedData);
        setFileUri(uriResult.uri);

        return parsedData;
      } catch (hookError: unknown) {
        const message = getErrorMessage(hookError, 'No fue posible leer el archivo.');

        if (isMissingFileMessage(message)) {
          setFileName(targetFileName);
          setContent('');
          setFileUri(null);
          return null;
        }

        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fileName],
  );

  return {
    fileName,
    content,
    fileUri,
    loading,
    error,
    setFileName,
    setContent,
    writeTextFile,
    readTextFile,
  };
};
