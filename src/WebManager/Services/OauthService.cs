using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using WebManager.Utilities;

namespace WebManager.Services
{
    public class OauthService
    {
        private RandomNumberGenerator _random = RandomNumberGenerator.Create();
        private SHA512 _hasher = SHA512.Create();
        private string _oauthStateCookieName = "_oa2s";
        private const string OauthAuthorizeEndpoint = "/oauth2/authorize/";
        private const string OauthTokenEndpoint = "/oauth2/token/";

        private HttpClientHandler _handler;
        private HttpClient _client;
        private ProgramOptions _opts;

        public OauthService(IOptions<ProgramOptions> opts)
        {
            _handler = new HttpClientHandler();
            _handler.Proxy = null;
            _handler.UseProxy = false;
            _handler.UseCookies = false;

            _opts = opts.Value;
            _client = new HttpClient(_handler);
        }

        /// <summary>
        /// Saves a cookie containing Oauth2 authentication state value onto the client.
        /// Returns the same state.
        /// </summary>
        /// <param name="resp"></param>
        public string SaveOauthStateCookie(HttpResponse resp, string redirectTo)
        {
            string s = GenerateSessionID(resp.HttpContext.Request) + '.' +
                WebUtility.HtmlEncode(redirectTo);

            resp.Cookies.Append(_oauthStateCookieName, s, new CookieOptions()
                { HttpOnly = true, Expires = new DateTimeOffset(DateTime.UtcNow.AddMinutes(10)) }
            );

            return s;
        }

        public string GetOauthStateCookie(HttpRequest resp)
        {
            if (resp.Cookies.ContainsKey(_oauthStateCookieName))
            {
                return resp.Cookies[_oauthStateCookieName];
            }
            return null;
        }

        /// <summary>
        /// Generate a url-safe random session ID for the given request
        /// based on a random hash of the request details. The goal
        /// is to prevent session IDs from being guessed by brute force attacks.
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        private string GenerateSessionID(HttpRequest req)
        {
            byte[] randomBytes = new byte[16];
            _random.GetBytes(randomBytes);

            var toHash = req.HttpContext.Connection.RemoteIpAddress.GetAddressBytes()
                .Concat(BitConverter.GetBytes(DateTime.Now.ToBinary()))
                .Concat(randomBytes).ToArray();

            return Utility.ToUrlSafeBase64(_hasher.ComputeHash(toHash));
        }

        public IActionResult Login(HttpContext context)
        {
            string redirectUrl = string.Format(_opts.Authority, _opts.Tenant);
            redirectUrl += OauthAuthorizeEndpoint;

            string postLoginRedirect = context.Request.Query.ContainsKey("redirect_to") ?
                (string) context.Request.Query["redirect_to"] :
                "/";

            StringBuilder queryString = new StringBuilder();
            queryString.Append("?client_id=");
            queryString.Append(_opts.ClientId);
            queryString.Append("&redirect_uri=");
            queryString.Append(_opts.LoginRedirectEndpoint);
            queryString.Append("&state=");
            queryString.Append(SaveOauthStateCookie(context.Response, postLoginRedirect));
            queryString.Append("&resource=");
            queryString.Append(_opts.ManagementResource);

            queryString.Append("&response_type=code");

            // Both form_post and query are supported by the WebManager. form_post
            // is recommended as the browser will not keep POST requests in history.
            queryString.Append("&response_mode=form_post");
            // queryString.Append("&response_mode=query");

            return new RedirectResult(redirectUrl + queryString.ToString());
        }

        /// <summary>
        /// Attempts to get an authorization token using an authorization code
        /// </summary>
        /// <returns>Whether an authorization token was successfully retrieved.</returns>
        public async Task<TokenRequestResponse> AcquireNewToken(string authCode)
        {
            StringBuilder content = new StringBuilder();

            content.Append("client_id=");
            content.Append(_opts.ClientId);
            content.Append("&client_secret=");
            content.Append(WebUtility.HtmlEncode(_opts.ClientSecret));
            content.Append("&tenant=");
            content.Append(_opts.Tenant);
            content.Append("&redirect_uri=");
            content.Append(_opts.LoginRedirectEndpoint);
            content.Append("&resource=");
            content.Append(_opts.ManagementResource);

            content.Append("&code=");
            content.Append(authCode);
            content.Append("&grant_type=authorization_code");

            HttpRequestMessage message = new HttpRequestMessage(HttpMethod.Post, string.Format(_opts.Authority, _opts.Tenant) + OauthTokenEndpoint);
            message.Content = new StringContent(content.ToString());
            message.Content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

            var resp = await _client.SendAsync(message);

            if (resp.IsSuccessStatusCode)
            {
                var token = JsonConvert.DeserializeObject<TokenRequestResponse>(await resp.Content.ReadAsStringAsync());
                if (token.Token_Type != "Bearer" || token.Resource != _opts.ManagementResource)
                {
                    // throw new InvalidOperationException();
                }

                return token;
            }

            return null;
        }
    }

    public class TokenRequestResponse
    {
        public string Access_Token { get; set; }
        public string Token_Type { get; set; }
        public int Expires_In { get; set; }
        public long Expires_On { get; set; }
        public string Resource { get; set; }
        public string Refresh_Token { get; set; }
        public string Scope { get; set; }
        
        /// <summary>
        /// This field will be null if a refresh request was issued.
        /// </summary>
        public string Id_Token { get; set; }

        public string Error { get; set; }
        public string Error_Description { get; set; }
        public List<int> Error_Codes { get; set; }
        public DateTime Timestamp { get; set; }
        public string Trace_Id { get; set; }
        public string Correlation_Id { get; set; }
    }
}
