using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebManager.Services;
using WebManager.Utility;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebManager.Controllers
{
    [Route("api/docker")]
    public class DockerController : Controller
    {
        private DockerApiService _service;

        public DockerController(DockerApiService service)
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

        // GET: api/<controller>
        [HttpGet]
        public async Task<IActionResult> Get()
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

            if (await _service.TestCredentials(cred.Registry, cred.BasicAuth))
            {
                return new OkResult();
            }

            return new UnauthorizedResult();
        }

        // GET api/<controller>/5
        [HttpGet("catalog")]
        public async Task<IActionResult> GetCatalog()
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
                StatusCode = (int)resp.Item2
            };
        }

        [HttpGet("{repo}/{tag}")]
        public async Task<IActionResult> Manifest(string repo, string tag)
        {
            RegistryCredential cred = GetDockerCredential();
            if (cred == null)
            {
                return new UnauthorizedResult();
            }

            var resp = await _service.Manifest(cred, repo, tag);

            if (resp == null)
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

        /// <summary>
        /// The client should set the following headers:
        /// Authorization: Basic
        /// Registry: (the name of the registry to access)
        /// </summary>
        [HttpGet("tags/{name}")]
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
                StatusCode = (int)resp.Item2
            };
        }

        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
