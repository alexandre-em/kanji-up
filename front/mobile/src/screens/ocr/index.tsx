import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Assets, Button, Colors, Icon, Text } from 'react-native-ui-lib';
import ActionSheet from 'react-native-ui-lib/actionSheet';
import { useSelector } from 'react-redux';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { screenNames } from '../../constants/screens';
import { core } from '../../services/http';
import { selectUserState } from '../../store/slices/user';

const PICKER_OPTIONS = { mediaType: 'photo' as const, quality: 0.8 as const, maxWidth: 1600, maxHeight: 1600 };

type ScreenStatus = 'idle' | 'uploading' | 'error';

export default function Ocr() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const userState = useSelector(selectUserState);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [status, setStatus] = useState<ScreenStatus>('idle');
  const [result, setResult] = useState<ScanResultType | null>(null);

  const runScan = useCallback(
    async (asset: Asset) => {
      if (!asset.uri) return;

      setStatus('uploading');
      setResult(null);

      try {
        const response = await core.scanService!.create(userState.macAddress, {
          uri: asset.uri,
          type: asset.type ?? 'image/jpeg',
          name: asset.fileName ?? 'scan.jpg',
        });
        setResult(response.data);
        setStatus('idle');
      } catch {
        setStatus('error');
      }
    },
    [userState.macAddress],
  );

  const handleCamera = useCallback(async () => {
    setPickerVisible(false);
    const response = await launchCamera(PICKER_OPTIONS);
    if (response.didCancel || !response.assets?.[0]) return;
    runScan(response.assets[0]);
  }, [runScan]);

  const handleGallery = useCallback(async () => {
    setPickerVisible(false);
    const response = await launchImageLibrary(PICKER_OPTIONS);
    if (response.didCancel || !response.assets?.[0]) return;
    runScan(response.assets[0]);
  }, [runScan]);

  const handleTokenPress = useCallback(
    (token: ScanTokenType) => {
      if (!token.wordId) return;
      navigation.navigate(screenNames.WORD as never, { id: token.wordId } as never);
    },
    [navigation],
  );

  return (
    <Layout screen="ocr">
      {status === 'uploading' && (
        <RNView style={styles.center}>
          <ActivityIndicator color={Colors.$backgroundPrimaryHeavy} size="large" />
          <Spacing y={12} />
          <Text text80M $textGeneral>
            {t('ocr.uploading')}
          </Text>
        </RNView>
      )}

      {status === 'error' && (
        <RNView style={styles.center}>
          <Text text80M $textGeneral center>
            {t('ocr.error')}
          </Text>
          <Spacing y={16} />
          <Button label={t('ocr.retry')} onPress={() => setPickerVisible(true)} outline />
        </RNView>
      )}

      {status === 'idle' && !result && (
        <RNView style={styles.center}>
          <Icon source={Assets.icons.recognition} size={48} tintColor={Colors.$iconPrimary} />
          <Spacing y={12} />
          <Text text80M $textGeneral center>
            {t('ocr.empty.message')}
          </Text>
          <Spacing y={20} />
          <Button label={t('ocr.scan.button')} onPress={() => setPickerVisible(true)} />
        </RNView>
      )}

      {status === 'idle' && result && (
        <RNView>
          <Text text70BO>{t('ocr.result.title')}</Text>
          <Spacing y={12} />
          {result.tokens.length === 0 ? (
            <Text text80M $textGeneral>
              {t('ocr.result.empty')}
            </Text>
          ) : (
            <RNView style={styles.tokenRow}>
              {result.tokens.map((token, index) => (
                <TouchableOpacity
                  key={`${token.text}-${index}`}
                  disabled={!token.wordId}
                  onPress={() => handleTokenPress(token)}
                  style={[styles.token, token.wordId && styles.tokenMatched]}
                  accessibilityRole={token.wordId ? 'button' : undefined}>
                  <Text text70M color={token.wordId ? Colors.$textPrimary : Colors.$textDefault}>
                    {token.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </RNView>
          )}
          <Spacing y={24} />
          <Button label={t('ocr.rescan')} onPress={() => setPickerVisible(true)} outline />
        </RNView>
      )}

      <ActionSheet
        visible={pickerVisible}
        title={t('ocr.picker.title')}
        cancelButtonIndex={2}
        onDismiss={() => setPickerVisible(false)}
        options={[
          { label: t('ocr.picker.camera'), onPress: handleCamera },
          { label: t('ocr.picker.gallery'), onPress: handleGallery },
          { label: t('ocr.picker.cancel'), onPress: () => setPickerVisible(false) },
        ]}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  tokenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  token: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tokenMatched: {
    backgroundColor: Colors.$backgroundPrimaryLight,
  },
});
