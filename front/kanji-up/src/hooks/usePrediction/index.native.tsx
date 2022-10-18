import React, {useCallback, useState} from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export default function usePrediction({}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState(null);

  const loadModel = useCallback(async () => {

  }, [loading, model]);

  return null;
};

