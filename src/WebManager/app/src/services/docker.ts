import axios from "axios"
import { AxiosRequestConfig, AxiosResponse, CancelToken, CancelTokenSource } from "axios";
import { Promise } from "es6-promise";
import { CredentialService, RegistryCredentials } from "./credential";

export class Docker {
    private credService: CredentialService = new CredentialService();
    private registryEndpoint: string;

    constructor(public registryName: string) {
        // this.registryEndpoint = "https://" + this.registryName;
        this.registryEndpoint = null;
    }

    createCancelToken(): CancelTokenSource {
        return axios.CancelToken.source();
    }

    // note: we can't use the Link HTTP header yet because we need to forward requests
    // through the server in order to satisfy CORS policies
    getRepos(maxResults: number | null = 10, last: string = null, cancel: CancelToken = null):
        any {
        let cred: RegistryCredentials = this.credService.getRegistryCredentials(this.registryName);
        if (!cred) {
            return Promise.resolve({ repositories: null, httpLink: null });
        }

        let authHeader: string = this.getAuthHeader(cred)
        let config: AxiosRequestConfig = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            params: {},
            headers: {
                "Registry": this.registryName,
                "Authorization": authHeader
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
                    console.log(e.message);
                    return Promise.reject(e);
                }
            });
    }

    getManifest(repo: string, tag: string, cancel: CancelToken = null):
        any {
        let cred: RegistryCredentials = this.credService.getRegistryCredentials(this.registryName);
        if (!cred) {
            return Promise.resolve({ manifest: null });
        }

        let authHeader: string = this.getAuthHeader(cred)
        let config: AxiosRequestConfig = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            params: {},
            headers: {
                "Registry": this.registryName,
                "Accept": "application/vnd.docker.distribution.manifest.v2+json; 0.6, " +
                    "application/vnd.docker.distribution.manifest.v1+json; 0.5",
                "Authorization": authHeader
            }
        };

        return axios.get(`/v2/${repo}/manifests/${tag}`, config)
            .then((r: AxiosResponse) => {
                return { manifest: r.data }
            }).catch((e: any) => {
                if (axios.isCancel(e)) {
                    return null;
                }
                else {
                    console.log(e.message);
                    return Promise.reject(e);
                }
            });
    }

    // for whatever reason, the docker registry doesn't respect the tag pagination API...
    // this will just return all the tags at once
    getTagsForRepo(repo: string, maxResults: number | null = 10, last: string = null, cancel: CancelToken = null):
        any {
        let cred: RegistryCredentials = this.credService.getRegistryCredentials(this.registryName);
        if (!cred) {
            return Promise.resolve({ tags: null, httpLink: null });
        }

        let authHeader: string = this.getAuthHeader(cred)
        let config: AxiosRequestConfig = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            params: {},
            headers: {
                "Registry": this.registryName,
                "Authorization": authHeader
            }
        };

        if (maxResults != null) {
            config.params.n = maxResults;
        }
        if (last != null) {
            config.params.last = last;
        }

        return axios.get(`/v2/${repo}/tags/list`, config)
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
                    console.log(e);
                    return Promise.reject(e);
                }
            });
    }

    tryAuthenticate(cred: RegistryCredentials, cancel: CancelToken = null): any {
        let authHeader:string = this.getAuthHeader(cred)
        let config: AxiosRequestConfig = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            headers: {
                "Registry": this.registryName,
                "Authorization": authHeader
            }
        }

        return axios.get("/v2/", config)
            .then((r: AxiosResponse) => {
                if (r.status === 200) {
                    this.credService.setRegistryCredentials(this.registryName, cred);
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
                        console.log(e);
                        return Promise.reject(e);
                    }
                }
                else {
                    console.log(e);
                    return Promise.reject(e);
                }
            });
    }

    getAuthHeader(cred: RegistryCredentials): string {
        if (cred.basicAuth !== "Og==") {
            return "Basic " + cred.basicAuth;
        }
        if (cred.tokenAuth !== "") {
            return "Bearer " + cred.tokenAuth;
        }
        return "";
    }
}
