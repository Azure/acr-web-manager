import axios from "axios"
import { AxiosRequestConfig, AxiosResponse, CancelToken, CancelTokenSource } from "axios";
import { Promise } from "es6-promise";
import { CredentialService, BasicCredentials, BearerCredentials, AADCredentials } from "./credential";

export class BearerChallenge {
    public realm: string;
    public service: string;
    public scope: string;
}

export class Docker {
    private credService: CredentialService = new CredentialService();
    private registryEndpoint: string;

    constructor(public registryName: string) {
        this.registryEndpoint = "http://" + this.registryName;
    }

    createCancelToken(): CancelTokenSource {
        return axios.CancelToken.source();
    }

    getAuthorizeHeader(endpoint: string, cancel: CancelToken = null): Promise<string> {
        let basic: BasicCredentials = this.credService.getBasicCredentials(this.registryName);
        if (basic) {
            return Promise.resolve("Basic " + basic.basicAuth);
        }

        let bearer: BearerCredentials = this.credService.getBearerCredentials(this.registryName);
        if (bearer) {
            return this.getBearerChallenge(endpoint, cancel)
                .then(ch => {
                    if (!ch) {
                        return null;
                    }

                    let config: AxiosRequestConfig = {
                        cancelToken: cancel,
                        params: {},
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    };

                    let body = `service=${encodeURIComponent(ch.service)}&` +
                        `refresh_token=${encodeURIComponent(bearer.refreshToken)}` +
                        `&grant_type=refresh_token&scope=${encodeURIComponent(ch.scope)}`;

                    return axios.post(ch.realm, body, config)
                        .then((r: AxiosResponse) => {
                            return "Bearer " + r.data.access_token as string;
                        }).catch((e: any) => {
                            if (axios.isCancel(e)) {
                                return Promise.resolve<string>(null);
                            }
                            else {
                                return Promise.reject<string>(e);
                            }
                        });
                });
        }

        return Promise.resolve<string>(null);
    }

    // note: we can't use the Link HTTP header yet because we need to forward requests
    // through the server in order to satisfy CORS policies
    getRepos(maxResults: number | null = 10, last: string = null, cancel: CancelToken = null):
        Promise<{ repositories: string[], httpLink: string }> {
        return this.getAuthorizeHeader("/v2/_catalog", cancel).then(header => {
            if (!header) {
                return Promise.resolve({ repositories: null, httpLink: null });
            }

            let config: AxiosRequestConfig = {
                cancelToken: cancel,
                baseURL: this.registryEndpoint,
                params: {},
                headers: {
                    "Authorization": header
                }
            };

            if (maxResults != null) {
                config.params.n = maxResults;
            }
            if (last != null) {
                config.params.last = last;
            }

            return axios.get("/v2/_catalog", config)
                .then((r: AxiosResponse) => {
                    return { repositories: r.data.repositories, httpLink: r.headers.link }
                }).catch((e: any) => {
                    if (axios.isCancel(e)) {
                        return null;
                    }
                    else {
                        return Promise.reject(e);
                    }
                });
        });
    }

    getManifest(repo: string, tag: string, cancel: CancelToken = null):
        Promise<{ manifest: string }> {

        let endpoint = `/v2/${repo}/manifests/${tag}`;
        return this.getAuthorizeHeader(endpoint, cancel).then(header => {
            if (!header) {
                return Promise.resolve({ repositories: null, httpLink: null });
            }

            let config: AxiosRequestConfig = {
                cancelToken: cancel,
                baseURL: this.registryEndpoint,
                params: {},
                headers: {
                    "Accept": "application/vnd.docker.distribution.manifest.v2+json; 0.6, " +
                    "application/vnd.docker.distribution.manifest.v1+json; 0.5",
                    "Authorization": header
                }
            };

            return axios.get(endpoint, config)
                .then((r: AxiosResponse) => {
                    return { manifest: r.data }
                }).catch((e: any) => {
                    if (axios.isCancel(e)) {
                        return null;
                    }
                    else {
                        return Promise.reject(e);
                    }
                });
        });
    }

    // for whatever reason, the docker registry doesn't respect the tag pagination API...
    // this will just return all the tags at once
    getTagsForRepo(repo: string, maxResults: number | null = 10, last: string = null, cancel: CancelToken = null):
        Promise<{ tags: string[], httpLink: string }> {

        let endpoint = `/v2/${repo}/tags/list`;
        return this.getAuthorizeHeader(endpoint, cancel).then(header => {
            if (!header) {
                return Promise.resolve({ repositories: null, httpLink: null });
            }

            let config: AxiosRequestConfig = {
                cancelToken: cancel,
                baseURL: this.registryEndpoint,
                params: {},
                headers: {
                    "Authorization": header
                }
            };

            if (maxResults != null) {
                config.params.n = maxResults;
            }
            if (last != null) {
                config.params.last = last;
            }

            return axios.get(endpoint, config)
                .then((r: AxiosResponse) => {
                    if (r.data.tags === undefined) {
                        console.log(r.data.errors)
                        return null;
                    }

                    return { tags: r.data.tags, httpLink: r.headers.link }
                }).catch((e: any) => {
                    if (axios.isCancel(e)) {
                        return null;
                    }
                    else {
                        return Promise.reject(e);
                    }
                });
        });
    }

    tryAuthenticate(cred: BasicCredentials, cancel: CancelToken = null): Promise<boolean> {
        let config: AxiosRequestConfig = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            headers: {
                "Authorization": "Basic " + cred.basicAuth
            }
        }

        return axios.get("/v2/", config)
            .then((r: AxiosResponse) => {
                if (r.status === 200) {
                    this.credService.setBasicCredentials(this.registryName, cred);
                    return true;
                }
                return false;
            })
            .catch((e: any) => {
                if (axios.isCancel(e)) {
                    return false;
                }
                else if (e.response) {
                    let r: AxiosResponse = e.response;
                    if (r.status === 401) {
                        return false;
                    }
                    else {
                        return Promise.reject(e);
                    }
                }
                else {
                    return Promise.reject(e);
                }
            });
    }

    getBearerChallenge(endpoint: string, cancel: CancelToken = null): Promise<BearerChallenge> {
        let config: AxiosRequestConfig = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            validateStatus: (status) => status < 500
        }

        return axios.get(endpoint, config)
            .then((r: AxiosResponse) => {
                if (r.status === 200) {
                    return null;
                }
                else if (r.status === 401) {
                    let challenge = r.headers["www-authenticate"]
                    if (challenge === undefined) {
                        return null;
                    }

                    let bc: BearerChallenge = {
                        realm: null,
                        service: null,
                        scope: ""
                    }

                    let tokens = (challenge as string).split(" ", 2);
                    for (let el of tokens[1].split(",")) {
                        let values = el.trim().split("=", 2);
                        if (values[0].trim() == "realm") {
                            bc.realm = values[1].trim();
                            bc.realm = bc.realm.substr(1, bc.realm.length - 2);
                        }
                        else if (values[0].trim() == "service") {
                            bc.service = values[1].trim();
                            bc.service = bc.service.substr(1, bc.service.length - 2);
                        }
                        else if (values[0].trim() == "scope") {
                            bc.scope = values[1].trim();
                            bc.scope = bc.scope.substr(1, bc.scope.length - 2);
                        }
                    }

                    if (!bc.realm || !bc.service) {
                        return null;
                    }
                    return bc;
                }

                return null;
            })
            .catch((e: any) => {
                if (axios.isCancel(e)) {
                    return null;
                }
                else {
                    return Promise.reject(e);
                }
            });
    }

    acquireRefreshToken(challenge: BearerChallenge, cancel: CancelToken = null):
        Promise<boolean> {
        let cred: AADCredentials = this.credService.getAADCredentials();
        if (!cred) {
            return Promise.resolve(false);
        }

        let parser = document.createElement('a');
        parser.href = challenge.realm;

        let config: AxiosRequestConfig = {
            cancelToken: cancel,
            baseURL: (parser as any).origin,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };

        let body = `service=${encodeURIComponent(challenge.service)}&` +
            `refresh_token=${encodeURIComponent(cred.refresh)}&user_type=user&tenant=common`;

        return axios.post("/oauth2/exchange", body, config)
            .then((r: AxiosResponse) => {
                let cred: BearerCredentials = {
                    refreshToken: r.data.refresh_token
                };
                this.credService.setBearerCredentials(this.registryName, cred);
                return true;
            }).catch((e: any) => {
                if (axios.isCancel(e)) {
                    return false;
                }
                else {
                    return Promise.reject(e);
                }
            });
    }
}
