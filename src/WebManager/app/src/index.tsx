import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ES6Promise from "es6-promise";

import { Application } from "./components/application";

ES6Promise.polyfill();

ReactDOM.render(
    <Application />,
    document.getElementById("router")
);