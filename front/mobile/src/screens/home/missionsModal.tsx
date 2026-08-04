import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Assets, Colors, Icon, ProgressBar, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../components/spacing';

const { Dialog } = Incubator;

const MISSION_TASKS: MissionTaskKey[] = ['kanjiSession', 'wordSession', 'kanjiMastery'];

type MissionsModalProps = {
  visible: boolean;
  missions: DailyMissionType | null;
  onClose: () => void;
};

export default function MissionsModal({ visible, missions, onClose }: MissionsModalProps) {
  const { t } = useTranslation();

  const doneCount = missions ? MISSION_TASKS.filter((task) => missions.tasks[task]).length : 0;
  const allDone = doneCount === MISSION_TASKS.length;

  return (
    <Dialog visible={visible} onDismiss={onClose} bottom useSafeArea width="100%">
      <RNView style={styles.modal}>
        <RNView style={styles.header}>
          <Icon source={Assets.icons.check} size={28} tintColor={Colors.$iconPrimary} />
          <Text text70BO>{t('missions.title')}</Text>
        </RNView>
        <Spacing y={4} />
        <Text text90M $textGeneral>
          {t('missions.subtitle')}
        </Text>
        <Spacing y={16} />
        <ProgressBar progress={(doneCount / MISSION_TASKS.length) * 100} />
        <Spacing y={4} />
        <Text text90M $textGeneral>
          {t('missions.progress', { done: doneCount, total: MISSION_TASKS.length })}
        </Text>
        <Spacing y={20} />
        {MISSION_TASKS.map((task) => {
          const done = missions?.tasks[task] ?? false;

          return (
            <RNView key={task} style={styles.taskRow}>
              <RNView style={[styles.taskIcon, done && styles.taskIconDone]}>
                {done && <Icon source={Assets.icons.check} size={14} tintColor={Colors.$iconSuccess} />}
              </RNView>
              <Text text80M color={done ? Colors.$textDefault : Colors.$textNeutral} style={styles.taskLabel}>
                {t(`missions.task.${task}`)}
              </Text>
            </RNView>
          );
        })}
        <Spacing y={20} />
        {allDone ? (
          <Text text80BO color={Colors.$textSuccess} center>
            {t('missions.allDone')}
          </Text>
        ) : doneCount === 0 ? (
          <Text text90M $textGeneral center>
            {t('missions.empty')}
          </Text>
        ) : (
          <Text text90M $textGeneral center>
            {t('missions.reward')}
          </Text>
        )}
      </RNView>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: Colors.$backgroundDefault,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  taskIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.$outlineNeutral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconDone: {
    backgroundColor: Colors.$backgroundSuccessLight,
    borderColor: Colors.$backgroundSuccessLight,
  },
  taskLabel: {
    flex: 1,
  },
});
