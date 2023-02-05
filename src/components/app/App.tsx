import { FC } from "react";
import { TopBar } from "@components/containers/top_bar/TopBar";
import { AppBody } from "@components/containers/app_body/AppBody";
import { Footer } from "@components/containers/footer/Footer";
import "./App.css";

const App: FC = () => {
    return (
        <div id="app-container">
            <TopBar />
            <AppBody />
            <Footer />
        </div>
    );
};

export { App };
