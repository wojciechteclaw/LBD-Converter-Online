var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TopBar } from "../containers/top_bar/TopBar";
import { AppBody } from "../containers/app_body/AppBody";
import { Footer } from "../containers/footer/Footer";
import "./App.css";
var App = function () {
    return (_jsxs("div", __assign({ id: "app-container" }, { children: [_jsx(TopBar, {}), _jsx(AppBody, {}), _jsx(Footer, {})] })));
};
export { App };
