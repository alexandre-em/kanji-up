import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Assets, Button, Colors, Icon, Text } from 'react-native-ui-lib';
import ActionSheet from 'react-native-ui-lib/actionSheet';
import { useSelector } from 'react-redux';

import AppBannerAd from '../../components/bannerAd';
import Spacing from '../../components/spacing';
import { screenNames } from '../../constants/screens';
import { core } from '../../services/http';
import { selectUserState } from '../../store/slices/user';

const PICKER_OPTIONS = { mediaType: 'photo' as const, quality: 0.8 as const, maxWidth: 1600, maxHeight: 1600 };
const HISTORY_LIMIT = 20;

type ScreenStatus = 'idle' | 'uploading' | 'error';

export default function Ocr() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const userState = useSelector(selectUserState);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [status, setStatus] = useState<ScreenStatus>('idle');
  const [result, setResult] = useState<ScanResultType | null>(null);

  const [historyItems, setHistoryItems] = useState<ScanSummaryType[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyStatus, setHistoryStatus] = useState<RequestStatusType>('idle');

  const loadHistory = useCallback(
    async (page: number) => {
      if (!userState.userId) return;

      setHistoryStatus('pending');
      try {
        const response = await core.scanService!.list(userState.userId, page, HISTORY_LIMIT);
        setHistoryItems((prev) => (page === 1 ? response.data.docs : [...prev, ...response.data.docs]));
        setHistoryTotal(response.data.totalDocs);
        setHistoryPage(page);
        setHistoryStatus('succeeded');
      } catch {
        setHistoryStatus('failed');
      }
    },
    [userState.userId],
  );

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory]);

  const runScan = useCallback(
    async (asset: Asset) => {
      if (!asset.uri) return;

      setStatus('uploading');
      setResult(null);

      try {
        const response = await core.scanService!.create(userState.userId, {
          uri: asset.uri,
          type: asset.type ?? 'image/jpeg',
          name: asset.fileName ?? 'scan.jpg',
        });
        setResult(response.data);
        setStatus('idle');
        setHistoryItems((prev) => [
          {
            scanId: response.data.scanId,
            imageUrl: response.data.imageUrl,
            recognizedText: response.data.recognizedText,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setHistoryTotal((prev) => prev + 1);
      } catch {
        setStatus('error');
      }
    },
    [userState.userId],
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

  const handleHistoryEndReached = useCallback(() => {
    if (historyStatus === 'pending' || historyItems.length >= historyTotal) return;
    loadHistory(historyPage + 1);
  }, [historyStatus, historyItems.length, historyTotal, historyPage, loadHistory]);

  const listHeader = (
    <RNView>
      <Spacing y={20} />
      <Text h1>{t('ocr.title')}</Text>
      <Text text80L>{t('ocr.subtitle')}</Text>
      <Spacing y={10} />
      <AppBannerAd style={styles.banner} />
      <Spacing y={10} />

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

      <Spacing y={28} />
      <Text text70BO>{t('ocr.history.title')}</Text>
      <Spacing y={12} />
    </RNView>
  );

  return (
    <RNView style={styles.container}>
      <FlashList
        data={historyItems}
        keyExtractor={(item) => item.scanId}
        renderItem={({ item }) => (
          <RNView style={styles.historyRow}>
            <Image source={{ uri: item.imageUrl }} style={styles.historyThumbnail} />
            <RNView style={styles.historyContent}>
              <Text text80M numberOfLines={2}>
                {item.recognizedText || t('ocr.result.empty')}
              </Text>
              <Text text100L $textNeutral>
                {new Date(item.createdAt).toLocaleDateString(i18n.language)}
              </Text>
            </RNView>
          </RNView>
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          historyStatus !== 'pending' ? (
            <Text text80M $textGeneral>
              {t('ocr.history.empty')}
            </Text>
          ) : null
        }
        ListFooterComponent={
          historyStatus === 'pending' && historyPage > 1 ? (
            <RNView style={styles.footer}>
              <ActivityIndicator color={Colors.$backgroundPrimaryHeavy} size="small" />
            </RNView>
          ) : null
        }
        onEndReached={handleHistoryEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
      />

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
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.$backgroundDefault,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  banner: {
    alignItems: 'center',
  },
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
  historyRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.$outlineNeutral,
  },
  historyThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.$backgroundNeutralLight,
  },
  historyContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
