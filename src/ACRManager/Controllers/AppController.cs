using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace WebManager
{
    public class AppController : Controller
    {
        private readonly IHostingEnvironment _hostEnvironment;
        private string _indexFile = null;

        public AppController(IHostingEnvironment env)
        {
            _hostEnvironment = env;
        }

        [HttpGet]
        public IActionResult Index(string registry)
        {
            if (_indexFile == null)
            {
                _indexFile = System.IO.File.ReadAllText(
                    Path.Combine(_hostEnvironment.WebRootPath, "index.html"));
            }
            return new ContentResult()
            {
                Content = _indexFile,
                ContentType = "text/html",
                StatusCode = StatusCodes.Status200OK
            };
        }
    }
}
