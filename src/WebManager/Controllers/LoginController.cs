using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using WebManager.Services;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace WebManager.Controllers
{
    public class OidcAuthModel
    {
        [Display(Name = "Admin Consent")]
        public bool Admin_Consent { get; set; }

        [Display(Name = "Code")]
        public string Code { get; set; }

        [Display(Name = "Session State")]
        public string Session_State { get; set; }

        [Display(Name = "Error")]
        public string Error { get; set; }

        [Display(Name = "Error Description")]
        public string Error_Description { get; set; }

        [Required]
        [Display(Name = "State")]
        public string State { get; set; }
    }

    public class OidcRedirectModel
    {
        public TokenRequestResponse Token { get; set; }
        public string RedirectTo { get; set; }
    }

    public class LoginController : Controller
    {
        private DockerApiService _dockerService;
        private OauthService _armService;
        private string _callbackFile;

        public LoginController(IHostingEnvironment env, DockerApiService dockerService, OauthService armService)
        {
            _dockerService = dockerService;
            _armService = armService;

            _callbackFile = System.IO.File.ReadAllText(
                Path.Combine(env.WebRootPath, "callback.html"));
        }

        [HttpGet]
        public IActionResult Oidc()
        {
            return _armService.Login(HttpContext);
        }

        /// <summary>
        /// This callback is used when response_type is set to query in OIDC.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetCallback()
        {
            string state = Request.Query["state"];
            string code = Request.Query["code"];
            string error = Request.Query["error"];
            string errorDesc = Request.Query["error_description"];

            if (state != _armService.GetOauthStateCookie(Request))
            {
                return new JsonResult("Session state mismatch");
            }

            if (!string.IsNullOrEmpty(code))
            {
                var token = await _armService.AcquireNewToken(code);

                if (token != null)
                {
                    return new ContentResult
                    {
                        StatusCode = 200,
                        ContentType = "text/html",
                        Content = FormatCallbackHtml(state.Split('.')[1], token)
                    };
                }
                else
                {
                    return new JsonResult("Error occurred retrieving token");
                }
            }
            else
            {
                return new JsonResult("Error occurred: " + error + " " + errorDesc);
            }
        }

        public string FormatCallbackHtml(string redirectUrl, TokenRequestResponse token)
        {
            return string.Format(_callbackFile,
                redirectUrl,
                token.Access_Token,
                token.Refresh_Token,
                token.Expires_On,
                token.Scope,
                token.Resource);
        }

        /// <summary>
        /// This callback is used when response_type is set to form_post in OIDC.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> PostCallback([FromForm] OidcAuthModel model)
        {
            if (model.State != _armService.GetOauthStateCookie(Request))
            {
                return new JsonResult("Session state mismatch");
            }

            if (!string.IsNullOrEmpty(model.Code))
            {
                var token = await _armService.AcquireNewToken(model.Code);

                if (token != null)
                {
                    return new ContentResult
                    {
                        StatusCode = 200,
                        ContentType = "text/html",
                        Content = FormatCallbackHtml(model.State.Split('.')[1], token)
                    };
                }
                else
                {
                    return new JsonResult("Error occurred retrieving token");
                }
            }
            else
            {
                return new JsonResult("Error occurred: " + model.Error + " " + model.Error_Description);
            }
        }
    }
}