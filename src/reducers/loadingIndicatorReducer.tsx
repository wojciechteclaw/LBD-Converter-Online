import { LoadingIndicationVisibility } from "@enums/loadingIndicationVisibility";
import { ILoadingIndicator } from "@interfaces/LoadingIndicator/ILoadingIndicator";
import { ILoadingIndicatorAction } from "@interfaces/LoadingIndicator/ILoadingIndicatorAction";

const LoadingIndicatorReducer = (state: ILoadingIndicator, action: ILoadingIndicatorAction) => {
    switch (action.type) {
        case LoadingIndicationVisibility.SHOW_LOADING_INDICATOR:
            return {
                ...state,
                isLoading: true,
                message: action.payload.message,
            };
        case LoadingIndicationVisibility.HIDE_LOADING_INDICATOR:
            return {
                ...state,
                isLoading: false,
            };
        default:
            return state;
    }
};

export { LoadingIndicatorReducer };
