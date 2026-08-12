import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Assets, Colors, Icon, ProgressBar, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../../components/spacing';
import { useMissionsModalStyles } from '../hooks/useMissionsModalStyles';

const { Dialog } = Incubator;

const MISSION_TASKS: MissionTaskKey[] = ['kanjiSession', 'wordSession', 'kanjiMastery'];

type MissionsModalProps = {
  visible: boolean;
  missions: DailyMissionType | null;
  onClose: () => void;
};

export default function MissionsModal({ visible, missions, onClose }: MissionsModalProps) {
  const { t } = useTranslation();
  const styles = useMissionsModalStyles();

  const doneCount = missions ? MISSION_TASKS.filter((task) => missions.tasks[task]).length : 0;
  const allDone = doneCount === MISSION_TASKS.length;

  return (
    <Dialog
      visible={visible}
      onDismiss={onClose}
      bottom
      useSafeArea
      width="100%"
      // RNUI's Dialog memoizes its own background without a theme dependency, so it can freeze
      // on whichever scheme was active at first mount — this forces it fresh on every render
      containerStyle={{ backgroundColor: Colors.$backgroundDefault }}>
      <RNView style={styles.modal}>
        <RNView style={styles.header}>
          <Icon source={Assets.icons.check} size={28} tintColor={Colors.$iconPrimary} />
          <Text text70BO $textDefault>
            {t('missions.title')}
          </Text>
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
