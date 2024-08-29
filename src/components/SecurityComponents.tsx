import React, { ReactNode } from 'react';
import { useStore } from '../hooks/useStore';

type SecurityGateProps = {
  children: ReactNode;
  FallbackComponent: React.ComponentType;
};

type TestFunction = (userStore: ReturnType<typeof useStore>['userStore']) => boolean;

const createSecurityGate = (testFn: TestFunction) => {
  const SecurityGate: React.FC<SecurityGateProps> = ({ children, FallbackComponent }) => {
    const { userStore } = useStore();

    if (testFn(userStore)) {
      return <>{children}</>;
    } else {
      return  <FallbackComponent />
    }
  };

  return SecurityGate;
};

const GodModeGate = createSecurityGate((userStore) => userStore.godMode);
const LoggedInGate = createSecurityGate((userStore) => !!userStore.teamId);

export { GodModeGate, LoggedInGate };
