import { FC } from "react";
import { dbDataController } from "@services/dependency_injection";
import "./GraphMenu.css";

interface GraphMenuProps {
    onGraphPngDownload: () => void;
}

const GraphMenu: FC<GraphMenuProps> = ({ onGraphPngDownload }) => {
    return (
        <div id="graph-menu-container">
            <p>
                <i className="upload icon graph-menu-icon" id="graph-menu-icon-upload"></i>
                <i className="download icon graph-menu-icon" onClick={() => dbDataController.saveStoreData()}></i>
                <i className="image outline icon graph-menu-icon" onClick={onGraphPngDownload}></i>
            </p>
        </div>
    );
};

export { GraphMenu };
