import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import usePrediction from '../../../hooks/usePrediction';
import { RootState } from '../../../store';

export default function useModelDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ progress: 0, showDialog: false, message: '' });
  const model = usePrediction();
  const settingState = useSelector((state: RootState) => state.settings);

  const handleDismissDownload = useCallback(() => {
    setDownloadProgress({ progress: 0, showDialog: false, message: '' });
  }, []);

  useEffect(() => {
    (async () => {
      const isStored = await model.isBufferStored;
      if (model && !isStored && !isDownloading && settingState && settingState.accessToken) {
        setIsDownloading(true);
        const onDownloadProgress = (progressEvent: any) => {
          const percentCompleted = progressEvent.loaded / progressEvent.total;
          setDownloadProgress({ progress: percentCompleted, showDialog: true, message: 'Downloading models...' });
        };
        const handleProgress =
          Platform.OS === 'web'
            ? onDownloadProgress
            : (progress: number) => {
                setDownloadProgress({ progress, showDialog: true, message: 'Downloading kanji recognition model...' });
              };
        const headers = { Authorization: `Bearer ${settingState.accessToken}` };
        await model.downloadThenSave(handleProgress, () => setDownloadProgress((prev) => ({ ...prev, message: 'Saving the model on the device...' })), headers);
        setDownloadProgress((prev) => ({ ...prev, showDialog: false }));
      }
    })();
  }, [model, isDownloading, settingState]);

  return {
    downloadProgress,
    handleDismissDownload,
  };
}
