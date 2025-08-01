import { createContext, useContext } from "react";

export const GlobalContext = createContext(undefined);

export const GlobalContextProvider = ({ children }) => {

    return (
        <GlobalContext.Provider value={{}}>
            {children}
        </GlobalContext.Provider>
    )
}

export default function useGlobalContext() {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error("useGlobalContext must be used within an GlobalContextProvider.");
    }

    return context;
}