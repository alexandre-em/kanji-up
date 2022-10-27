interface CustomDialogProps {
  visible: boolean;
  message: {
    title: string;
    description: string;
  };
  onCancel: () => void;
  onDismiss: () => void;
  onSave: () => void;
}

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onValueChange: (newValue: number) => void;
};

interface SketchProps {
  visible: boolean;
}

