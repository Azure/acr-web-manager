"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var es6_promise_1 = require("es6-promise");
var credential_1 = require("./credential");
var Docker = (function () {
    function Docker(registryName) {
        this.registryName = registryName;
        this.credService = new credential_1.CredentialService();
        // this.registryEndpoint = "https://" + this.registryName;
        this.registryEndpoint = null;
    }
    Docker.prototype.createCancelToken = function () {
        return axios_1.default.CancelToken.source();
    };
    // note: we can't use the Link HTTP header yet because we need to forward requests
    // through the server in order to satisfy CORS policies
    Docker.prototype.getRepos = function (maxResults, last, cancel) {
        if (maxResults === void 0) { maxResults = 10; }
        if (last === void 0) { last = null; }
        if (cancel === void 0) { cancel = null; }
        var cred = this.credService.getRegistryCredentials(this.registryName);
        if (!cred) {
            return es6_promise_1.Promise.resolve({ repositories: null, httpLink: null });
        }
        var config = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            params: {},
            headers: {
                "Registry": this.registryName,
                "Authorization": "Basic " + cred.basicAuth
            }
        };
        if (maxResults != null) {
            config.params.n = maxResults;
        }
        if (last != null) {
            config.params.last = last;
        }
        return axios_1.default.get("/v2/_catalog", config)
            .then(function (r) {
            return { repositories: r.data.repositories, httpLink: r.headers.link };
        }).catch(function (e) {
            if (axios_1.default.isCancel(e)) {
                return null;
            }
            else {
                console.log(e.message);
                return es6_promise_1.Promise.reject(e);
            }
        });
    };
    Docker.prototype.getManifest2 = function (repo, tag, cancel) {
        if (cancel === void 0) { cancel = null; }
        var cred = this.credService.getRegistryCredentials(this.registryName);
        if (!cred) {
            return es6_promise_1.Promise.resolve({ manifest: null });
        }
        var config = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            params: {},
            headers: {
                "Registry": this.registryName,
                "Access-Control-Expose-Headers": "X-Ms-Request-Id",
                "Accept": "application/vnd.docker.distribution.manifest.v2+json; 0.6, " +
                    "application/vnd.docker.distribution.manifest.v1+json; 0.5",
                "Authorization": "Basic " + cred.basicAuth
            }
        };
        return axios_1.default.get("/v2/" + repo + "/manifests/" + tag, config)
            .then(function (r) {
            return { manifest: r.headers };
        }).catch(function (e) {
            if (axios_1.default.isCancel(e)) {
                return null;
            }
            else {
                console.log(e.message);
                return es6_promise_1.Promise.reject(e);
            }
        });
    };
    Docker.prototype.getManifest = function (repo, tag, cancel) {
        if (cancel === void 0) { cancel = null; }
        var cred = this.credService.getRegistryCredentials(this.registryName);
        if (!cred) {
            return es6_promise_1.Promise.resolve({ manifest: null });
        }
        var config = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            params: {},
            headers: {
                "Registry": this.registryName,
                "Accept": "application/vnd.docker.distribution.manifest.v2+json; 0.6, " +
                    "application/vnd.docker.distribution.manifest.v1+json; 0.5," +
                    "application/vnd.docker.distribution.manifest.list.v2+json",
                "Authorization": "Basic " + cred.basicAuth
            }
        };
        return axios_1.default.get("/v2/" + repo + "/manifests/" + tag, config)
            .then(function (r) {
            return { manifest: r.data };
        }).catch(function (e) {
            if (axios_1.default.isCancel(e)) {
                return null;
            }
            else {
                console.log(e.message);
                return es6_promise_1.Promise.reject(e);
            }
        });
    };
    Docker.prototype.putMultiArch = function (repo, tag, cancel, manifest) {
        if (cancel === void 0) { cancel = null; }
        var cred = this.credService.getRegistryCredentials(this.registryName);
        if (!cred) {
            return es6_promise_1.Promise.resolve({ rBody: null });
        }
        var config = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            params: {},
            headers: {
                "Registry": this.registryName,
                "Content-Type": "application/JSON",
                "Authorization": "Basic " + cred.basicAuth
            }
        };
        return axios_1.default.put("/v2/" + repo + "/manifests/" + tag, manifest, config)
            .then(function (r) {
            return { rBody: r.status };
        }).catch(function (e) {
            if (axios_1.default.isCancel(e)) {
                return null;
            }
            else {
                console.log(e.message);
                return es6_promise_1.Promise.reject(e);
            }
        });
    };
    // for whatever reason, the docker registry doesn't respect the tag pagination API...
    // this will just return all the tags at once
    Docker.prototype.getTagsForRepo = function (repo, maxResults, last, cancel) {
        if (maxResults === void 0) { maxResults = 10; }
        if (last === void 0) { last = null; }
        if (cancel === void 0) { cancel = null; }
        var cred = this.credService.getRegistryCredentials(this.registryName);
        if (!cred) {
            return es6_promise_1.Promise.resolve({ tags: null, httpLink: null });
        }
        var config = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            params: {},
            headers: {
                "Registry": this.registryName,
                "Authorization": "Basic " + cred.basicAuth
            }
        };
        if (maxResults != null) {
            config.params.n = maxResults;
        }
        if (last != null) {
            config.params.last = last;
        }
        console.log(axios_1.default.get("/v2/" + repo + "/tags/list", config));
        return axios_1.default.get("/v2/" + repo + "/tags/list", config)
            .then(function (r) {
            if (r.data.tags === undefined) {
                console.log(r.data.errors);
                return null;
            }
            return { tags: r.data.tags, httpLink: r.headers.link };
        }).catch(function (e) {
            if (axios_1.default.isCancel(e)) {
                return null;
            }
            else {
                console.log(e);
                return es6_promise_1.Promise.reject(e);
            }
        });
    };
    Docker.prototype.tryAuthenticate = function (cred, cancel) {
        var _this = this;
        if (cancel === void 0) { cancel = null; }
        var config = {
            cancelToken: cancel,
            baseURL: this.registryEndpoint,
            headers: {
                "Registry": this.registryName,
                "Authorization": "Basic " + cred.basicAuth
            }
        };
        return axios_1.default.get("/v2/", config)
            .then(function (r) {
            if (r.status === 200) {
                _this.credService.setRegistryCredentials(_this.registryName, cred);
                return true;
            }
            return false;
        })
            .catch(function (e) {
            if (axios_1.default.isCancel(e)) {
                return false;
            }
            else if (e.response) {
                var r = e.response;
                if (r.status === 401) {
                    return false;
                }
                else {
                    console.log(e);
                    return es6_promise_1.Promise.reject(e);
                }
            }
            else {
                console.log(e);
                return es6_promise_1.Promise.reject(e);
            }
        });
    };
    return Docker;
}());
exports.Docker = Docker;
//# sourceMappingURL=docker.js.map