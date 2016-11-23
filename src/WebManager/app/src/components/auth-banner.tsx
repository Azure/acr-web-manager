import * as React from "react";
import { CancelTokenSource } from "axios";
import { browserHistory } from "react-router";
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";

import { BasicCredentials, CredentialService } from "../services/credential";
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
            formMessage: ""
        };
    }

    componentWillMount(): void {
        let basic = this.credService.getBasicCredentials(this.props.service.registryName);
        let bearer = this.credService.getBearerCredentials(this.props.service.registryName);

        if (basic || bearer) {
            if (this.props.onLogin) {
                this.props.onLogin();
            }

            this.setState({
                loggedInAs: bearer ? "Active Directory user" : basic.username
            } as IAuthBannerState);
        }
        else {
            this.cancel = this.props.service.createCancelToken();
            this.props.service.getBearerChallenge("/v2/", this.cancel.token)
                .then(challenge => {
                    this.cancel = null;

                    if (!challenge) { // basic auth only
                        return;
                    }

                    if (!this.credService.getAADCredentials()) { // get aad token
                        window.location.href =
                            "/login/oidc?redirect_to=" + encodeURIComponent(window.location.toString());
                        return;
                    }

                    this.cancel = this.props.service.createCancelToken();
                    // get refresh token
                    this.props.service.acquireRefreshToken(challenge, this.cancel.token)
                        .then(ok => {
                            if (ok) {
                                if (this.props.onLogin) {
                                    this.props.onLogin();
                                }

                                this.setState({
                                    loggedInAs: "Active Directory user"
                                } as IAuthBannerState);
                            }
                            else {
                                // AAD login failed, use SPN instead
                            }
                        }).catch(x => this.cancel = null);
                }).catch(x => this.cancel = null);
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
            formUsername: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        } as IAuthBannerState);
    }

    onPasswordChange(e: React.FormEvent<HTMLInputElement>): void {
        this.setState({
            formPassword: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        } as IAuthBannerState);
    }

    onPasswordKeyPress(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.charCode == 13) {
            this.submitCredential();
        }
    }

    onLogout(): void {
        this.setState({
            loggedInAs: null
        } as IAuthBannerState);

        this.credService.setBasicCredentials(this.props.service.registryName, null);

        if (this.props.onLogout) {
            this.props.onLogout();
        }
    }

    submitCredential(): void {
        if (this.cancel) {
            return;
        }

        let cred: BasicCredentials = new BasicCredentials();
        cred.username = this.state.formUsername;
        cred.basicAuth = btoa(this.state.formUsername + ":" + this.state.formPassword);

        this.setState({
            formPassword: ""
        } as IAuthBannerState);

        this.cancel = this.props.service.createCancelToken();

        this.props.service.tryAuthenticate(cred, this.cancel.token)
            .then((success: boolean) => {
                this.cancel = null;

                if (success) {
                    this.setState({
                        loggedInAs: cred.username
                    } as IAuthBannerState);

                    this.credService.setBasicCredentials(this.props.service.registryName, cred);

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
                            <div className="ms-Grid-col ms-u-sm3">
                                <div className="ms-TextField">
                                    <input className="ms-TextField-field" type="text"
                                        placeholder="Username"
                                        onChange={this.onUsernameChange.bind(this)} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-u-sm3">
                                <div className="ms-TextField">
                                    <input className="ms-TextField-field" type="password"
                                        placeholder="Password"
                                        onChange={this.onPasswordChange.bind(this)}
                                        onKeyPress={this.onPasswordKeyPress.bind(this)} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-u-sm2">
                                <div>
                                    <Button className="banner-auth-row-login-button"
                                        disabled={this.cancel != null}
                                        buttonType={ButtonType.primary}
                                        onClick={this.submitCredential.bind(this)} >
                                        Log in
                                    </Button>
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-u-sm4">
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

