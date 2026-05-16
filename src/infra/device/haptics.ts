export type HapticImpact = 'light' | 'medium' | 'heavy';

export const impact = async (type: HapticImpact): Promise<void> => {
  void type;
};
