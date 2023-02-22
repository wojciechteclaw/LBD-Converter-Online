import { FC, useReducer } from "react";
import { FilesManagementContainer } from "@components/files_management_container/FilesManagementContainer";
import { GraphContainer } from "@components/graph_container/GraphContainer";
import { LoadingIndicator } from "@components/loading_indicator/LoadingIndicator";
import { LoadingIndicatorContext } from "@contexts/LoadingIndicatorContext";
import { ILoadingIndicator } from "@interfaces/LoadingIndicator/ILoadingIndicator";
import { LoadingIndicatorReducer } from "@reducers/loadingIndicatorReducer";
import "./AppBody.css";

const initialState: ILoadingIndicator = {
    isLoading: false,
    message: "",
};

const AppBody: FC = () => {
    const [state, dispatch] = useReducer(LoadingIndicatorReducer, initialState);
    return (
        <div id="app-body-container">
            <LoadingIndicatorContext.Provider value={{ state, dispatch }}>
                <FilesManagementContainer />
                <GraphContainer />
                <LoadingIndicator />
            </LoadingIndicatorContext.Provider>
        </div>
    );
};

export { AppBody };
