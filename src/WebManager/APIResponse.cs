using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace WebManager
{
    public class APIResponse
    {
        public string Content { set; get; } 
        public HttpStatusCode Status { set; get; }
        public string AditionalInfo { set; get; }
        public int Size { get; }

        public APIResponse(string content, HttpStatusCode status)
        {
            this.Content = content;
            this.Status = status;
            this.Size = this.Content.Length;
        }

        public APIResponse(string content, HttpStatusCode status, string digest)
        {
            this.Content = content;
            this.Status = status;
            this.AditionalInfo = digest;
            this.Size = this.Content.Length;
        }
    }
}
