import { LoadingIndicatorContext } from "@contexts/LoadingIndicatorContext";
import { useContext } from "react";
import "./LoadingIndicator.css";

const LoadingIndicator = () => {
    const { state } = useContext(LoadingIndicatorContext);

    if (!state.isLoading) return null;
    return (
        <div className="loading-indicator-container">
            <div className="loading-indicator-content-wrapper">
                <img
                    src="./assets/loading.gif"
                    alt="loading..."
                    className="loading-indicator-loading-gif"
                />
                <p className="loading-indicator-message-payload">{state.message}</p>
            </div>
        </div>
    );
};

export { LoadingIndicator };
