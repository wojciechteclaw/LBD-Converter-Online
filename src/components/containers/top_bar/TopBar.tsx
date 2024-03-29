import { FC } from "react";
import "./TopBar.css";

export const TopBar: FC = () => {
    return (
        <div id="top-bar-container">
            <a href="https://github.com/LBD-Hackers" target="_blank" style={{ height: "100%", width: "auto" }}>
                <div id="top-bar-logo-container" style={{ height: "100%", width: "auto" }}>
                    <img src={"./assets/logo.png"} />
                </div>
            </a>
            <div className="top-bar-menu">
                <div className="top-bar-menu-wrappers">
                    <div id="top-bar-contact-container">Paper</div>
                </div>
                <div className="top-bar-menu-wrappers">
                    <a href="https://github.com/LBD-Hackers/IFC-LBD/" target="_blank">
                        <div id="top-bar-contact-container">IFC-LBD</div>
                    </a>
                </div>
                <div className="top-bar-menu-wrappers">
                    <a href="https://www.linkedin.com/in/wojciech-teclaw/">
                        <div id="top-bar-contact-container">Contact</div>
                    </a>
                </div>
            </div>
        </div>
    );
};
