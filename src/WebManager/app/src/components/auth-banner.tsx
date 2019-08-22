﻿import * as React from "react";
import { CancelTokenSource } from "axios";
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";

import { RegistryCredentials, CredentialService } from "../services/credential";
import { Docker } from "../services/docker";

export interface IAuthBannerProps {
    service: Docker,
    onLogout: () => void,
    onLogin: () => void
}
interface IAuthBannerState {
    loggedInAs: string,
    formUsername: string,
    formPassword: string,
    formToken: string,
    formMessage: string
}

export class AuthBanner extends React.Component<IAuthBannerProps, IAuthBannerState> {
    private credService: CredentialService = new CredentialService();
    private cancel: CancelTokenSource = null;

    constructor(props: IAuthBannerProps) {
        super(props);

        this.state = {
            loggedInAs: null,
            formUsername: "",
            formPassword: "",
            formToken: "",
            formMessage: ""
        };
    }

    componentWillMount(): void {
        let credential = this.credService.getRegistryCredentials(this.props.service.registryName);


        if (credential != null) {
            this.setState({
                loggedInAs: credential.tokenAuth != "" ? "AAD user" : credential.username
            });
            if (this.props.onLogin) {
                this.props.onLogin();
            }
        }
    }

    componentWillUnmount(): void {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    }

    onUsernameChange(e: React.FormEvent<HTMLInputElement>): void {
        this.setState({
            formUsername: (e.target as HTMLInputElement).value.replace(/[^\x00-\x7F]/g, ""),
        } as IAuthBannerState);
    }

    onPasswordChange(e: React.FormEvent<HTMLInputElement>): void {
        this.setState({
            formPassword: (e.target as HTMLInputElement).value.replace(/[^\x00-\x7F]/g, ""),
        } as IAuthBannerState);
    }

    onPasswordKeyPress(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.charCode == 13) {
            this.submitCredential();
        }
    }

    onTokenChange(e: React.FormEvent<HTMLInputElement>): void {
        this.setState({
            formToken: (e.target as HTMLInputElement).value.replace(/[^\x00-\x7F]/g, ""),
        } as IAuthBannerState);
    }

    onLogout(): void {
        this.setState({
            loggedInAs: null
        } as IAuthBannerState);

        this.credService.setRegistryCredentials(this.props.service.registryName, null);

        if (this.props.onLogout) {
            this.props.onLogout();
        }
    }

    submitCredential(): void {
        if (this.cancel) {
            return;
        }

        if ((this.state.formUsername != "" && this.state.formToken != "") || (this.state.formPassword != "" && this.state.formToken != "")) {
            this.setState({
                formMessage: "Invalid credentials"
            } as IAuthBannerState);
        }

        let cred: RegistryCredentials = new RegistryCredentials();
        cred.username = this.state.formUsername;
        cred.basicAuth = btoa(this.state.formUsername + ":" + this.state.formPassword);
        cred.tokenAuth = this.state.formToken;

        this.setState({
            formPassword: "",
            formToken: ""
        } as IAuthBannerState);

        this.cancel = this.props.service.createCancelToken();

        this.props.service.tryAuthenticate(cred, this.cancel.token)
            .then((success: boolean) => {
                this.cancel = null;

                if (success) {
                    this.setState({
                        loggedInAs: cred.tokenAuth != "" ? "AAD user" : cred.username
                    } as IAuthBannerState);

                    this.credService.setRegistryCredentials(this.props.service.registryName, cred);

                    if (this.props.onLogin) {
                        this.props.onLogin();
                    }
                }
                else {
                    this.setState({
                        formMessage: "Invalid credentials"
                    } as IAuthBannerState);
                }
            }).catch((err: any) => {
                this.cancel = null;
            });
    }

    renderAuthPanel(): JSX.Element {
        if (this.state.loggedInAs) {
            return null;
        }
        else {
            return (
                <div className="header header-auth-panel ms-bgColor-themeLight">
                    <div className="banner ms-Grid">
                        <div className="ms-Grid-row banner-auth-row">
                            <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">
                                <div className="ms-TextField">
                                    <input className="ms-TextField-field" type="text"
                                        placeholder="Username"
                                        disabled={this.state.formToken != ""}
                                        onChange={this.onUsernameChange.bind(this)} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">
                                <div className="ms-TextField">
                                    <input className="ms-TextField-field" type="password"
                                        placeholder="Password"
                                        disabled={this.state.formToken != ""}
                                        onChange={this.onPasswordChange.bind(this)}
                                        onKeyPress={this.onPasswordKeyPress.bind(this)} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">
                                <div className="ms-TextField">
                                    <input className="ms-TextField-field" type="password"
                                        placeholder="Aad token"
                                        disabled={this.state.formUsername != "" || this.state.formPassword != ""}
                                        onChange={this.onTokenChange.bind(this)}
                                        onKeyPress={this.onPasswordKeyPress.bind(this)} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">
                                <div>
                                    <Button className="banner-auth-row-login-button"
                                        disabled={this.cancel != null}
                                        buttonType={ButtonType.primary}
                                        onClick={this.submitCredential.bind(this)} >
                                        Log in
                                    </Button>
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">
                                <span className="ms-fontColor-black ms-font-l banner-auth-row-info">
                                    {this.state.formMessage}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    render(): JSX.Element {
        return (
            <div>
                <div className="header ms-bgColor-themeDarker">
                    <div className="banner banner-primary">
                        <span className="banner-title ms-font-xxl ms-fontColor-white">
                            <a href="/">Azure Container Registry</a>
                        </span>
                        <LoginPanel loggedInAs={this.state.loggedInAs} onLogout={this.onLogout.bind(this)} />
                    </div>
                </div>

                {this.renderAuthPanel()}
            </div>
        );
    }
}

interface ILoginPanelProps { loggedInAs: string, onLogout: () => void }

class LoginPanel extends React.Component<ILoginPanelProps, {}> {
    render(): JSX.Element {
        if (!this.props.loggedInAs) {
            return null;
        }
        else {
            return (
                <div className="banner-login-group">
                    <span className="banner-logged-in ms-font-l ms-fontColor-themeLight">
                        Logged in as {this.props.loggedInAs}
                    </span>
                    <span className="banner-logout ms-font-l ms-fontColor-themeLight" onClick={this.props.onLogout}>
                        (log out)
                </span>
                </div>
            );
        }
    }
}

