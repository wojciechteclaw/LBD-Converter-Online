import { FC } from "react";
import { FilesManagementContainer } from "@components/files_management_container/FilesManagementContainer";
import { GraphContainer } from "@components/graph_container/GraphContainer";
import "./AppBody.css";

const AppBody: FC = () => {
    return (
        <div id="app-body-container">
            <FilesManagementContainer />
            <GraphContainer />
        </div>
    );
};

export { AppBody };
