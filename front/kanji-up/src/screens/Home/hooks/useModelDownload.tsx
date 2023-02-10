import {useCallback, useEffect, useState} from "react";
import {Platform} from "react-native";
import usePrediction from "../../../hooks/usePrediction";

export default function useModelDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ progress: 0, showDialog: false, message: '' });
  const model = usePrediction();

  const handleDismissDownload = useCallback(() => {
    setDownloadProgress({ progress: 0, showDialog: false, message: '' });
  }, []);

  useEffect(() => {
    (async () => {
      const isStored = await model.isBufferStored;
      if (model && !(isStored) && !isDownloading) {
        setIsDownloading(true);
        const onDownloadProgress = (progressEvent: any) => {
          const percentCompleted = progressEvent.loaded / progressEvent.total;
          setDownloadProgress({ progress: percentCompleted, showDialog: true, message: 'Downloading models...' });

        };
        await model.downloadThenSave(Platform.OS === 'web' ? onDownloadProgress : (progress: number) => { setDownloadProgress({ progress, showDialog: true, message: 'Downloading kanji recognition model...' }); }, () => setDownloadProgress((prev) => ({ ...prev, message: 'Saving the model on the device...' })));
        setDownloadProgress((prev) =>  ({ ...prev, showDialog: false }));
      }
    })();
  }, [model, isDownloading]);

  return {
    downloadProgress,
    handleDismissDownload,
  };
}
