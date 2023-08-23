import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import Model, { ModelMode, ModelObject } from '../utils/Model';
import RecognitionModel from '../utils/RecognitionModel';
import useIndexedDb from '../hooks/useIndexedDb';
import { kanjiPredictionConstants } from '../utils/constants';

type ModelContextValueType = {
  models: { [key: string]: Model };
  isLoading: boolean;
  downloadProgression: number;
};

const ModelContext = createContext<ModelContextValueType | null>(null);

export const useModelContext = () => {
  return useContext(ModelContext);
};

export default function ModelProvider({
  mode,
  modelObject,
  children,
}: {
  mode: ModelMode;
  modelObject?: ModelObject;
  children: ReactNode;
}) {
  const [models, setModels] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgression, setDownloadProgression] = useState(0);

  const startDb = useIndexedDb();

  useEffect(() => {
    if (mode) {
      setIsLoading(true);
      if (!models[kanjiPredictionConstants.MODEL_KEY]) {
        if (mode === ModelMode.LOCAL) {
          const recognitionModel = new RecognitionModel(mode, {});

          recognitionModel.load().then(() => {
            setModels((prevState) => ({ ...prevState, recognition: recognitionModel }));
            setIsLoading(false);
          });
        } else {
          const recognitionModel = new RecognitionModel(mode, modelObject!);

          recognitionModel.isModelStored().then((b) => {
            if (b)
              recognitionModel.load().then(() => {
                setModels((prevState) => ({ ...prevState, recognitionModel: recognitionModel }));
                setIsLoading(false);
              });
            else
              recognitionModel
                .download(async (m) => {
                  if (Platform.OS === 'web') startDb(m, kanjiPredictionConstants.MODEL_KEY);
                })
                .then(() => {
                  setModels((prevState) => ({ ...prevState, recognitionModel: recognitionModel }));
                  setIsLoading(false);
                });
          }, setDownloadProgression);
        }
      }
    }
  }, [mode, modelObject, models]);

  return <ModelContext.Provider value={{ models, isLoading, downloadProgression }}>{children}</ModelContext.Provider>;
}
