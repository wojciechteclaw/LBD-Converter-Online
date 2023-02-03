import { dbDataController } from "@services/dependency_injection";
import { FC } from "react";
import "./GraphMenu.css";

const GraphMenu: FC = () => {
    return (
        <div id="graph-menu-container">
            <p>
                <i className="download icon" id="graph-menu-icon" onClick={() => dbDataController.saveStoreData()}></i>
            </p>
        </div>
    );
};

export { GraphMenu };
