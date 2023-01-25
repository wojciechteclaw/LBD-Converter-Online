import { FC } from "react";
import "./TopBar.css";

const TopBar: FC = () => {
    return (
        <div id="top-bar-container">
            <div id="top-bar-logo-container" style={{ height: "100%", width: "auto" }}>
                <img src="./img/sampleLogo.png" />
            </div>
            <div className="top-bar-menu">
                <div className="top-bar-menu-wrappers">
                    <div id="top-bar-contact-container">Paper</div>
                </div>
                <div className="top-bar-menu-wrappers">
                    <div id="top-bar-contact-container">IFC-LBD</div>
                </div>
                <div className="top-bar-menu-wrappers">
                    <div id="top-bar-contact-container">Contact</div>
                </div>
            </div>
        </div>
    );
};

export { TopBar };
