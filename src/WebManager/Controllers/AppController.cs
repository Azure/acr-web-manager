using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace WebManager
{
    public class AppController : Controller
    {
        private string _indexFile = null;

        public AppController(IHostingEnvironment env)
        {
            _indexFile = System.IO.File.ReadAllText(
                Path.Combine(env.WebRootPath, "index.html"));
        }

        [HttpGet]
        public IActionResult Index(string registry)
        {
            return new ContentResult()
            {
                Content = _indexFile,
                ContentType = "text/html",
                StatusCode = StatusCodes.Status200OK
            };
        }
    }
}
