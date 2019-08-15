import * as React from "react";
import { Route, Router, Switch } from "react-router";
import history from './history'

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
            <Router history={history} >
                <Switch>
                    <Route exact path='/' component={Login} />
                    <Route exact path="/:registryName" component={Catalog} />
                    <Route exact path="/:registryName/:repositoryName" component={Repository} />
                </Switch>
            </Router>);
    }
}