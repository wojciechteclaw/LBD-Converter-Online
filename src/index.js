import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { App } from "./components/app/App";
var container = document.getElementById('root');
var root = createRoot(container);
root.render(_jsx(App, {}));
