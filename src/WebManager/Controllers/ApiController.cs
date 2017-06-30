using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebManager.Services;
using WebManager.Utility;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WebManager


{
  

    public class ApiController : Controller
    {
        private DockerApiService _service;

        public ApiController(DockerApiService service)
        {
            _service = service;
        }

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
        [HttpGet]
        public async Task<IActionResult> Catalog()
        {
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            var resp = await _service.Catalog(cred,
                Request.QueryString.HasValue ? Request.QueryString.Value : "");

            if (resp == null)
            {
                return new UnauthorizedResult();
            }

            if (resp.Item3 != null)
            {
                Response.Headers.Add("Link", resp.Item3);
            }

            return new ContentResult()
            {
                Content = resp.Item1,
                ContentType = "application/json",
                StatusCode = (int) resp.Item2
            };
        }

    

        [HttpPut]
        public async Task<IActionResult> Manifest(string repo, string tag,  [FromBody] string manifest)
        {

            string json = manifest;
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }
           
            var resp = await _service.PutMultiArch(cred, repo, tag, json);
            if(resp == null)
            {
                return new UnauthorizedResult();
            }

            return new ContentResult()
            {
                Content = resp.Item1,
                ContentType = "application/json",
                StatusCode = (int)resp.Item2
            };
        }

        [HttpGet]
        public async Task<IActionResult> Manifest(string repo, string tag)
        {
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            var resp = await _service.ManifestHeaders(cred, repo, tag);

            if (resp == null)
            {
                return new UnauthorizedResult();
            }
        
            Response.Headers.Add("Docker-Content-Digest", resp.Item3);
            Response.Headers.Add("Content-Length", resp.Item1.Length + "");
            return new ContentResult()
            {
                Content = resp.Item1,
                ContentType = "application/json",
                StatusCode = (int) resp.Item2
            };
        }

        /// <summary>
        /// The client should set the following headers:
        /// Authorization: Basic
        /// Registry: (the name of the registry to access)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> ListTags(string name)
        {
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            var resp = await _service.ListTags(cred, name,
                Request.QueryString.HasValue ? Request.QueryString.Value : "");

            if (resp == null)
            {
                return new UnauthorizedResult();
            }

            if (resp.Item3 != null)
            {
                Response.Headers.Add("Link", resp.Item3);
            }

            return new ContentResult()
            {
                Content = resp.Item1,
                ContentType = "application/json",
                StatusCode = (int) resp.Item2
            };
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

            // must have a TLD
            if (!cred.Registry.Contains("."))
            {
                return new UnauthorizedResult();
            }

            if (await _service.TestCredentials(cred.Registry, cred.BasicAuth))
            {
                return new OkResult();
            }

            return new UnauthorizedResult();
        }
    }
}
