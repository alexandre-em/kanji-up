interface GradientCardProps {
  title: string;
  subtitle: string;
  buttonTitle: string;
  image: any;
  onPress: function;
}

interface CustomDialogProps {
  actions?: boolean[];
  visible: boolean;
  message: {
    title: string;
    description: string;
  };
  component?: any;
  onCancel: () => void;
  onDismiss: () => void;
  onSave: () => void;
}

interface SvgProps {
  width: number;
  height: number;
}
