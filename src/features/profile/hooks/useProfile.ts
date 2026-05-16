export type ProfileState = {
  displayName: string;
  email: string;
};

export const useProfile = () => {
  return { profile: { displayName: '', email: '' } as ProfileState };
};
