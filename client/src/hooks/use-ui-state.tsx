import { createContext, useContext, useState, ReactNode } from "react";

// Interface for UI state
interface UIState {
  isSpinWheelOpen: boolean;
}

// Interface for context value
interface UIStateContextValue {
  uiState: UIState;
  setSpinWheelOpen: (isOpen: boolean) => void;
  hideUIElements: boolean;
}

// Create context with default value
const UIStateContext = createContext<UIStateContextValue | undefined>(undefined);

// Provider component
export function UIStateProvider({ children }: { children: ReactNode }) {
  const [uiState, setUIState] = useState<UIState>({
    isSpinWheelOpen: false
  });

  // Helper function to set spin wheel state
  const setSpinWheelOpen = (isOpen: boolean) => {
    setUIState(prevState => ({
      ...prevState,
      isSpinWheelOpen: isOpen
    }));
  };

  // Determine if UI elements should be hidden
  const hideUIElements = uiState.isSpinWheelOpen;

  // Context value
  const value = {
    uiState,
    setSpinWheelOpen,
    hideUIElements
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
}

// Custom hook to use the UI state
export function useUIState() {
  const context = useContext(UIStateContext);
  
  if (context === undefined) {
    throw new Error("useUIState must be used within a UIStateProvider");
  }
  
  return context;
}