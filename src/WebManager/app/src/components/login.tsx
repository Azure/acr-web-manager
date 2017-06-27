import * as React from "react";
import { browserHistory } from "react-router";
import { CancelTokenSource } from "axios";
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";

import { RegistryCredentials, CredentialService } from "../services/credential";
import { Docker } from "../services/docker";

import { RepositoryList } from "./repository-list";

export interface ILoginProps { }
interface ILoginState {
    formRegistry: string
    formUsername: string,
    formPassword: string,
    formMessage: string
}

export class Login extends React.Component<ILoginProps, ILoginState> {
    private credService: CredentialService = new CredentialService();
    private cancel: CancelTokenSource = null;

    constructor(props: ILoginProps) {
        super(props);

        this.state = {
            formRegistry: "",
            formUsername: "",
            formPassword: "",
            formMessage: "",
        };
    }

    extractDomain(url: string): string {
        let domain: string;

        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        }
        else {
            domain = url.split('/')[0];
        }

        return domain;
    }

    componentWillUnmount(): void {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    }

    onRegistryChange(e: React.FormEvent<HTMLInputElement>): void {
        this.setState({
            formRegistry: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        } as ILoginState);
    }

    onUsernameChange(e: React.FormEvent<HTMLInputElement>): void {
        this.setState({
            formUsername: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        } as ILoginState);
    }

    onPasswordChange(e: React.FormEvent<HTMLInputElement>): void {
        this.setState({
            formPassword: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        } as ILoginState);
    }

    onPasswordKeyPress(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.charCode == 13) {
            this.submitCredential();
        }
    }

    submitCredential(): void {
        if (this.cancel) {
            return;
        }

        let cred: RegistryCredentials = new RegistryCredentials();
        let service: Docker = new Docker(this.extractDomain(this.state.formRegistry));

        cred.username = this.state.formUsername;
        cred.basicAuth = btoa("composetest:P==L//y==5=T/=7DP/4F/RYdc7CSs=WY");

        this.setState({
            formPassword: "",
            formMessage: "",
        } as ILoginState);

        this.cancel = service.createCancelToken();

        service.tryAuthenticate(cred, this.cancel.token)
            .then((success: boolean) => {
                this.cancel = null;

                if (success) {
                    this.credService.setRegistryCredentials(service.registryName, cred);

                    browserHistory.push("/" + service.registryName);
                }
                else {
                    this.setState({
                        formMessage: "Invalid credentials"
                    } as ILoginState);
                }
            }).catch((err: any) => {
                this.cancel = null;

                this.setState({
                    formMessage: "Network error"
                } as ILoginState);
            });
    }

    render(): JSX.Element {
        return (
            <div>
                <div className="header ms-bgColor-themeDarker">
                    <div className="banner banner-primary">
                        <span className="banner-title ms-font-xxl ms-fontColor-white">
                            <a href="/">Azure Container Registry</a>
                        </span>
                    </div>
                </div>

                <div className="login ms-bgColor-themeLight">
                    <div className="login-title">
                        <span className="ms-font-xxl ms-fontColor-themeDarker">
                            Log in to Azure Container Registry Web Portal
                        </span>
                    </div>
                    <div className="login-panel">
                        <div className="ms-TextField login-field">
                            <input className="ms-TextField-field" type="text"
                                placeholder="Registry"
                                onChange={this.onRegistryChange.bind(this)} />
                        </div>
                        <div className="ms-TextField login-field">
                            <input className="ms-TextField-field" type="text"
                                placeholder="Username"
                                onChange={this.onUsernameChange.bind(this)} />
                        </div>
                        <div className="ms-TextField login-field">
                            <input className="ms-TextField-field" type="password"
                                placeholder="Password"
                                onChange={this.onPasswordChange.bind(this)}
                                onKeyPress={this.onPasswordKeyPress.bind(this)} />
                        </div>
                        <div className="login-button">
                            <Button disabled={this.cancel != null}
                                buttonType={ButtonType.primary}
                                onClick={this.submitCredential.bind(this)} >
                                Log in
                            </Button>
                        </div>
                        <span className="ms-fontColor-black ms-font-l login-message">
                            {this.state.formMessage}
                        </span>
                    </div>
                </div>
            </div >
        );
    }
}