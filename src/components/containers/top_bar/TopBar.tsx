import { FC } from "react";
import logo from "@assets/logo.png"
import "./TopBar.css";

const TopBar: FC = () => {
    return (
        <div id="top-bar-container">
            <a href="https://github.com/LBD-Hackers" target="_blank" style={{ height: "100%", width: "auto" }}>
                <div id="top-bar-logo-container" style={{ height: "100%", width: "auto" }}>
                    <img src={logo} />
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
                    <div id="top-bar-contact-container">Contact</div>
                </div>
            </div>
        </div>
    );
};

export { TopBar };
