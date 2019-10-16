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
            if (!Request.Headers.ContainsKey("Authorization"))
            {
                return null;
            }

            var header = Request.Headers["Authorization"];

            if (header.Count < 1)
            {
                return null;
            }

            if (!header[0].StartsWith("Basic "))
            {
                return null;
            }

            string basicAuth = header[0].Substring("Basic ".Length);

            if (!Request.Headers.ContainsKey("Registry"))
            {
                return null;
            }

            return new RegistryCredential() { BasicAuth = basicAuth, Registry = Request.Headers["Registry"] };
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

            var base64EncodedBytes = System.Convert.FromBase64String(cred.BasicAuth);
            var decodedAuth = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);

            var user = decodedAuth.Split(":")[0];
            var password = decodedAuth.Split(":")[1];

            int timeoutInMilliseconds = 1500000;
            CancellationToken ct = new CancellationTokenSource(timeoutInMilliseconds).Token;
            var client = LoginBasic(ct, user, password, cred.Registry);

            try
            {
                var repositories = await client.GetRepositoriesAsync(last, n);
                var jsonString = JsonConvert.SerializeObject(repositories);
                if (repositories.Names != null && repositories.Names.Count > 0)
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
        }

        [HttpGet("{repo}/manifests/{tag}")]
        public async Task<IActionResult> Manifest(string repo, string tag)
        {
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            var base64EncodedBytes = System.Convert.FromBase64String(cred.BasicAuth);
            var decodedAuth = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);

            var user = decodedAuth.Split(":")[0];
            var password = decodedAuth.Split(":")[1];

            int timeoutInMilliseconds = 1500000;
            CancellationToken ct = new CancellationTokenSource(timeoutInMilliseconds).Token;
            var client = LoginBasic(ct, user, password, cred.Registry);

            try
            {
                var acceptString = MediaTypeHelper.ManifestAcceptMediaTypes;
                var manifest = await client.GetManifestAsync(repo, tag, acceptString);
                var jsonString = JsonConvert.SerializeObject(manifest);

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
        }

        /// <summary>
        /// The client should set the following headers:
        /// Authorization: Basic
        /// Registry: (the name of the registry to access)
        /// </summary>
        [HttpGet("{name}/tags/list")]
        public async Task<IActionResult> ListTags(string name, [FromQuery(Name = "n")] int n = 10, [FromQuery(Name = "last")] string last = "")
        {
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            var base64EncodedBytes = System.Convert.FromBase64String(cred.BasicAuth);
            var decodedAuth = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);

            var user = decodedAuth.Split(":")[0];
            var password = decodedAuth.Split(":")[1];

            int timeoutInMilliseconds = 1500000;
            CancellationToken ct = new CancellationTokenSource(timeoutInMilliseconds).Token;
            var client = LoginBasic(ct, user, password, cred.Registry);

            try
            {
                var tags = await client.GetAcrTagsAsync(name, last, n);
                var jsonString = JsonConvert.SerializeObject(tags);
                if (tags.TagsAttributes != null && tags.TagsAttributes.Count > 0)
                {
                    var lastTag = tags.TagsAttributes[tags.TagsAttributes.Count - 1].Name;
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

            var base64EncodedBytes = System.Convert.FromBase64String(cred.BasicAuth);
            var decodedAuth = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);

            var user = decodedAuth.Split(":")[0];
            var password = decodedAuth.Split(":")[1];

            int timeoutInMilliseconds = 1500000;
            CancellationToken ct = new CancellationTokenSource(timeoutInMilliseconds).Token;
            var client = LoginBasic(ct, user, password, cred.Registry);
            try
            {
                await client.GetDockerRegistryV2SupportAsync();
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
        }

        private static AzureContainerRegistryClient LoginBasic(CancellationToken ct, string username, string password, string loginUrl)
        {
            AcrClientCredentials credentials = new AcrClientCredentials(AcrClientCredentials.LoginMode.Basic, loginUrl, username, password, ct);
            AzureContainerRegistryClient client = new AzureContainerRegistryClient(credentials);
            client.LoginUri = "https://" + loginUrl;
            return client;
        }
    }
}
