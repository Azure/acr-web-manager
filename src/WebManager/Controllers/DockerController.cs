using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.ContainerRegistry;
using Microsoft.Azure.ContainerRegistry.Models;
using Newtonsoft.Json;
using System;
using System.Threading;
using System.Threading.Tasks;
using WebManager.Utility;

namespace WebManager.Controllers
{
    [Route("v2")]
    public class DockerController : Controller
    {
        public RegistryCredential GetDockerCredential()
        {
            if (!Request.Headers.ContainsKey("Registry"))
            {
                return null;
            }

            if (!Request.Headers.ContainsKey("Authorization"))
            {
                return null;
            }

            var header = Request.Headers["Authorization"];

            if (header.Count < 1)
            {
                return null;
            }

            if (header[0].StartsWith("Basic "))
            {
                string basicAuth = header[0].Substring("Basic ".Length);
                return new RegistryCredential() { BasicAuth = basicAuth, Registry = Request.Headers["Registry"] };
            }

            if (header[0].StartsWith("Bearer "))
            {
                string bearerAuth = header[0].Substring("Bearer ".Length);
                return new RegistryCredential() { AadOauthToken = bearerAuth, Registry = Request.Headers["Registry"] };
            }
            return null;
        }

        /// <summary>
        /// The client should set the following headers:
        /// Authorization: Basic
        /// Registry: (the name of the registry to access)
        /// </summary>
        [HttpGet("_catalog")]
        public async Task<IActionResult> Catalog([FromQuery(Name = "n")] int n = 10, [FromQuery(Name = "last")] string last = "")
        {
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            try
            {
                var client = GetClient(cred);
                var repositories = await client.GetRepositoryListAsync(last, n);
                client.Dispose();
                var jsonString = JsonConvert.SerializeObject(repositories);
                if (repositories.Names != null && repositories.Names.Count > 0 && repositories.Names.Count >= n)
                {
                    var lastRepo = repositories.Names[repositories.Names.Count - 1];
                    var linkHeader = $"</v2/_catalog?last={last}&n={n}&orderby=>; rel=\"next\"";
                    Response.Headers.Add("Link", linkHeader);
                }
                return new ContentResult()
                {
                    Content = jsonString,
                    ContentType = "application/json",
                    StatusCode = 200
                };
            }
            catch (AcrErrorsException e)
            {
                return new ContentResult()
                {
                    Content = e.Response.Content,
                    ContentType = "application/json",
                    StatusCode = (int)e.Response.StatusCode
                };
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        [HttpGet("{repo}/manifests/{tag}")]
        public async Task<IActionResult> Manifest(string repo, string tag)
        {
            repo = System.Web.HttpUtility.UrlDecode(repo);
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            try
            {
                var client = GetClient(cred);
                var acceptString = "application/vnd.docker.distribution.manifest.v2+json";
                if (Request.Headers.ContainsKey("Accept"))
                {
                    acceptString = Request.Headers["Accept"];
                }
                var manifest = await client.GetManifestAsync(repo, tag, acceptString);
                client.Dispose();
                var jsonString = JsonConvert.SerializeObject((V2Manifest)manifest);
                return new ContentResult()
                {
                    Content = jsonString,
                    ContentType = "application/json",
                    StatusCode = 200
                };
            }
            catch (AcrErrorsException e)
            {
                return new ContentResult()
                {
                    Content = e.Response.Content,
                    ContentType = "application/json",
                    StatusCode = (int)e.Response.StatusCode
                };
            }
            catch (Exception e)
            {
                return new StatusCodeResult(500);
            }
        }

        /// <summary>
        /// The client should set the following headers:
        /// Authorization: Basic
        /// Registry: (the name of the registry to access)
        /// </summary>
        [HttpGet("{name}/tags/list")]
        public async Task<IActionResult> ListTags(string name, [FromQuery(Name = "n")] int n = 10, [FromQuery(Name = "last")] string last = "")
        {
            name = System.Web.HttpUtility.UrlDecode(name);
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            try
            {
                var client = GetClient(cred);
                var tags = await client.GetTagListAsync(name, last, n);
                client.Dispose();
                var jsonString = JsonConvert.SerializeObject(tags);
                if (tags.Tags != null && tags.Tags.Count > 0 && tags.Tags.Count >= n)
                {
                    var lastTag = tags.Tags[tags.Tags.Count - 1].Name;
                    var linkHeader = $"</acr/v1/{name}/_tags?last={lastTag}&n={n}&orderby=>; rel=\"next\"";
                    Response.Headers.Add("Link", linkHeader);
                }
                return new ContentResult()
                {
                    Content = jsonString,
                    ContentType = "application/json",
                    StatusCode = 200
                };
            }
            catch (AcrErrorsException e)
            {
                return new ContentResult()
                {
                    Content = e.Response.Content,
                    ContentType = "application/json",
                    StatusCode = (int)e.Response.StatusCode
                };
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        [HttpGet]
        public async Task<IActionResult> VerifyCredential()
        {
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            if (cred.Registry == null)
            {
                return new UnauthorizedResult();
            }

            if (!cred.Registry.Contains("."))
            {
                return new UnauthorizedResult();
            }

            try
            {
                var client = GetClient(cred);
                await client.CheckV2SupportAsync();
                client.Dispose();
                return new OkResult();
            }
            catch (AcrErrorsException e)
            {
                return new ContentResult()
                {
                    Content = e.Response.Content,
                    ContentType = "application/json",
                    StatusCode = (int)e.Response.StatusCode
                };
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        private static AzureContainerRegistryClient GetClient(RegistryCredential cred)
        {
            int timeoutInMilliseconds = 1500000;
            CancellationToken ct = new CancellationTokenSource(timeoutInMilliseconds).Token;

            if (cred.BasicAuth != null && cred.AadOauthToken != null)
            {
                // Only one authentication mechanism needs to be specified.
                return null;
            }

            if (cred.BasicAuth != null)
            {
                // Basic Auth
                var base64EncodedBytes = System.Convert.FromBase64String(cred.BasicAuth);
                var decodedAuth = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);

                var user = decodedAuth.Split(":")[0];
                var password = decodedAuth.Split(":")[1];
                return LoginBasic(ct, user, password, cred.Registry);

            }

            if (cred.AadOauthToken != null)
            {
                // Bearer Auth
                return LoginAad(ct, cred.AadOauthToken, cred.Registry);
            }
            return null;
        }

        private static AzureContainerRegistryClient LoginBasic(CancellationToken ct, string username, string password, string loginUrl)
        {
            AcrClientCredentials credentials = new AcrClientCredentials(AcrClientCredentials.LoginMode.Basic, loginUrl, username, password, ct);
            AzureContainerRegistryClient client = new AzureContainerRegistryClient(credentials)
            {
                LoginUri = "https://" + loginUrl
            };
            return client;
        }

        private static AzureContainerRegistryClient LoginAad(CancellationToken ct, string aadAccessToken, string loginUrl)
        {
            string tenant = null; // Tenant is optional

            AcrClientCredentials credentials = new AcrClientCredentials(aadAccessToken, loginUrl, tenant, null, ct);
            AzureContainerRegistryClient client = new AzureContainerRegistryClient(credentials)
            {
                LoginUri = "https://" + loginUrl
            };
            return client;
        }
    }
}
