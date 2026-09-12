import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View as RNView } from 'react-native';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Assets, Badge, Button, Colors, Icon, Text } from 'react-native-ui-lib';
import ActionSheet from 'react-native-ui-lib/actionSheet';
import { useSelector } from 'react-redux';

import AppBannerAd from '../../components/bannerAd';
import RecognizedTokens from '../../components/recognizedTokens';
import Spacing from '../../components/spacing';
import Lock from '../../components/svg/lock';
import { screenNames } from '../../constants/screens';
import { useIsOffline } from '../../providers/network';
import { core } from '../../services/http';
import { selectUserState } from '../../store/slices/user';
import { useOcrStyles } from './hooks/useOcrStyles';

const PICKER_OPTIONS = { mediaType: 'photo' as const, quality: 0.8 as const, maxWidth: 1600, maxHeight: 1600 };
const HISTORY_LIMIT = 20;

type ScreenStatus = 'idle' | 'uploading' | 'error';
type OcrTab = 'scan' | 'history';

export default function Ocr() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const userState = useSelector(selectUserState);
  const isOffline = useIsOffline();
  const styles = useOcrStyles();

  const [activeTab, setActiveTab] = useState<OcrTab>('scan');
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
            tokens: response.data.tokens,
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

  const handleHistoryEndReached = useCallback(() => {
    if (historyStatus === 'pending' || historyItems.length >= historyTotal) return;
    loadHistory(historyPage + 1);
  }, [historyStatus, historyItems.length, historyTotal, historyPage, loadHistory]);

  if (userState.subscriptionPlan !== 'premium') {
    return (
      <RNView style={[styles.container, styles.center]}>
        <Lock size={48} color={Colors.$iconPrimary} />
        <Spacing y={16} />
        <Text text70BO center>
          {t('ocr.premiumGate.title')}
        </Text>
        <Spacing y={8} />
        <Text text80M $textGeneral center>
          {t('ocr.premiumGate.message')}
        </Text>
        <Spacing y={20} />
        <Button label={t('ocr.premiumGate.cta')} onPress={() => navigation.navigate(screenNames.PREMIUM as never)} />
      </RNView>
    );
  }

  return (
    <RNView style={styles.container}>
      <RNView style={styles.listContent}>
        <Spacing y={20} />
        <Text h1>{t('ocr.title')}</Text>
        <Text text80L>{t('ocr.subtitle')}</Text>
        <Spacing y={16} />
        <RNView style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segment, activeTab === 'scan' && styles.segmentActive]}
            onPress={() => setActiveTab('scan')}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'scan' }}>
            <Text style={{ color: activeTab === 'scan' ? '#fff' : Colors.$textNeutral }}>{t('ocr.tabs.scan')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, activeTab === 'history' && styles.segmentActive]}
            onPress={() => setActiveTab('history')}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'history' }}>
            <Text style={{ color: activeTab === 'history' ? '#fff' : Colors.$textNeutral }}>{t('ocr.tabs.history')}</Text>
          </TouchableOpacity>
        </RNView>
      </RNView>

      {activeTab === 'scan' ? (
        <ScrollView contentContainerStyle={styles.listContent}>
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
              <Button label={t('ocr.retry')} onPress={() => setPickerVisible(true)} outline disabled={isOffline} />
              {isOffline && (
                <>
                  <Spacing y={8} />
                  <Badge
                    label={t('offline.badge')}
                    size={20}
                    backgroundColor={Colors.$backgroundNeutralMedium}
                    labelStyle={{ color: Colors.$textNeutral }}
                  />
                </>
              )}
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
              <Button label={t('ocr.scan.button')} onPress={() => setPickerVisible(true)} disabled={isOffline} />
              {isOffline && (
                <>
                  <Spacing y={8} />
                  <Badge
                    label={t('offline.badge')}
                    size={20}
                    backgroundColor={Colors.$backgroundNeutralMedium}
                    labelStyle={{ color: Colors.$textNeutral }}
                  />
                </>
              )}
            </RNView>
          )}

          {status === 'idle' && result && (
            <RNView>
              <Image source={{ uri: result.imageUrl }} style={styles.resultImage} resizeMode="cover" />
              <Spacing y={16} />
              <Text text70BO>{t('ocr.result.title')}</Text>
              <Spacing y={12} />
              <RecognizedTokens tokens={result.tokens} recognizedText={result.recognizedText} />
              <Spacing y={24} />
              <RNView style={styles.center}>
                <Button label={t('ocr.rescan')} onPress={() => setPickerVisible(true)} outline disabled={isOffline} />
                {isOffline && (
                  <>
                    <Spacing y={8} />
                    <Badge
                      label={t('offline.badge')}
                      size={20}
                      backgroundColor={Colors.$backgroundNeutralMedium}
                      labelStyle={{ color: Colors.$textNeutral }}
                    />
                  </>
                )}
              </RNView>
            </RNView>
          )}
        </ScrollView>
      ) : (
        <FlashList
          data={historyItems}
          keyExtractor={(item) => item.scanId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyRow}
              onPress={() => navigation.navigate(screenNames.SCAN_DETAIL as never, { scan: item } as never)}
              accessibilityRole="button">
              <Image source={{ uri: item.imageUrl }} style={styles.historyThumbnail} />
              <RNView style={styles.historyContent}>
                <RecognizedTokens tokens={item.tokens} recognizedText={item.recognizedText} />
                <Text text100L $textNeutral>
                  {new Date(item.createdAt).toLocaleDateString(i18n.language)}
                </Text>
              </RNView>
            </TouchableOpacity>
          )}
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
    </RNView>
  );
}
