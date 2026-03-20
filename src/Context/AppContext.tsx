import React, { createContext, useState, ReactNode } from "react";
import { FetchBackendResponse } from "../lib/utils";

interface DataContextType {
  apiData: FetchBackendResponse| null;
  setApiData: React.Dispatch<
    React.SetStateAction<FetchBackendResponse | null>
  >;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined,
);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [apiData, setApiData] = useState<FetchBackendResponse|null>(null);
  return (
  <DataContext.Provider value={{ apiData, setApiData }}>
    {children}
  </DataContext.Provider>
);
};
