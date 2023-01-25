import { FC } from "react";
import { TopBar } from "../containers/top_bar/TopBar";
import { AppBody } from "../containers/app_body/AppBody";
import { Footer } from "../containers/footer/Footer";
import "./App.css";

const App:FC = () => {
  return (
    <div id="app-container">
      <TopBar />
      <AppBody/>
      <Footer/>
    </div>
  );
};

export { App };
