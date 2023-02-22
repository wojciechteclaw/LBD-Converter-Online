import { ILoadingIndicator } from "./ILoadingIndicator";
import { ILoadingIndicatorAction } from "./ILoadingIndicatorAction";

interface ILoadingIndicatorContext {
    state: ILoadingIndicator;
    dispatch: React.Dispatch<ILoadingIndicatorAction>;
}

export { ILoadingIndicatorContext };
