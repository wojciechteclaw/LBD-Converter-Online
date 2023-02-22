import { ILoadingIndicatorContext } from "@interfaces/LoadingIndicator/ILoadingIndicatorContext";
import { createContext } from "react";

const LoadingIndicatorContext = createContext<ILoadingIndicatorContext>(
    {} as ILoadingIndicatorContext
);

export { LoadingIndicatorContext };
