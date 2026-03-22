import * as React from "react";

type PanelContextValue = {
  isRightPanelOpen: boolean;
  setRightPanelOpen: (v: boolean) => void;
};

const PanelContext = React.createContext<PanelContextValue>({
  isRightPanelOpen: false,
  setRightPanelOpen: () => {},
});

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [isRightPanelOpen, setRightPanelOpen] = React.useState(false);
  const value = React.useMemo(
    () => ({ isRightPanelOpen, setRightPanelOpen }),
    [isRightPanelOpen]
  );
  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

export function usePanelContext() {
  return React.useContext(PanelContext);
}
