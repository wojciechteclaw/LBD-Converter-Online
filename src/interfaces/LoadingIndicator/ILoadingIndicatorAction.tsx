import { LoadingIndicationVisibility } from "@enums/loadingIndicationVisibility";
import { ILoadingIndicator } from "./ILoadingIndicator";

interface ILoadingIndicatorAction {
    type: LoadingIndicationVisibility;
    payload: ILoadingIndicator;
}

export { ILoadingIndicatorAction };
