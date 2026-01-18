import React, { createContext, useContext, useEffect, useState } from 'react';

interface SSRContextType {
  isSSR: boolean;
  data: any;
  error: string | null;
}

const SSRContext = createContext<SSRContextType>({
  isSSR: false,
  data: null,
  error: null
});

export const useSSR = () => useContext(SSRContext);

interface SSRProviderProps {
  children: React.ReactNode;
  initialData?: any;
  initialError?: string | null;
}

export const SSRProvider: React.FC<SSRProviderProps> = ({ 
  children, 
  initialData = null, 
  initialError = null 
}) => {
  const [isSSR, setIsSSR] = useState(true);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  const contextValue: SSRContextType = {
    isSSR,
    data,
    error
  };

  return (
    <SSRContext.Provider value={contextValue}>
      {children}
    </SSRContext.Provider>
  );
};
