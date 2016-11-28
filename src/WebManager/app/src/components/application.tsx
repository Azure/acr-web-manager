import * as React from "react";
import { Router, Route, browserHistory } from "react-router";

import { Docker } from "../services/docker";

import { Catalog } from "./catalog";
import { Repository } from "./repository";
import { Login } from "./login";

export interface IApplicationProps { }
interface IApplicationState { }

export class Application extends React.Component<IApplicationProps, IApplicationState> {
    constructor(props: IApplicationProps) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <Router history={browserHistory}>
                <Route path="/" component={Login} />
                <Route path=":registryName" component={Catalog} />
                <Route path=":registryName/:repositoryName" component={Repository} />
                <Route path=":registryName/:repositoryNamespace/:repositoryName" component={Repository} />
            </Router>
        );
    }
}