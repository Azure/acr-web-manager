using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace WebManager
{
    public class APIResponse
    {
        public string content { set; get; } 
        public HttpStatusCode status { set; get; }
        public string aditionalInfo { set; get; }
        public int size { get; }

        public APIResponse(string content, HttpStatusCode status)
        {
            this.content = content;
            this.status = status;
            this.size = this.content.Length;
        }

        public APIResponse(string content, HttpStatusCode status, string digest)
        {
            this.content = content;
            this.status = status;
            this.aditionalInfo = digest;
            this.size = this.content.Length;
        }
    }
}
