import { dbDataController } from "@services/dependency_injection";
import { FC } from "react";
import "./GraphMenu.css";

const GraphMenu: FC = () => {
    return (
        <div id="graph-menu-container">
            <div id="graph-menu-content">
                <i className="download icon graph-menu-icon" onClick={() => dbDataController.saveStoreData()}></i>
            </div>
        </div>
    );
};

export { GraphMenu };
