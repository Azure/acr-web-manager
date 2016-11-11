using Microsoft.AspNetCore.Mvc;

namespace WebManager
{
    public class AppController : Controller
    {
        [HttpGet]
        public IActionResult Index(string registry) { return View("~/Views/Router/Index.cshtml"); }
    }
}
