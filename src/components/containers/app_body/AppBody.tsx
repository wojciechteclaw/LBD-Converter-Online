import { FC } from "react";
import { FilesManagementContainer } from "@components/files_management_container/FilesManagementContainer";

const AppBody: FC = () => {
    return (
        <div id="app-body-container">
            <FilesManagementContainer />
        </div>
    );
};

export {AppBody};
