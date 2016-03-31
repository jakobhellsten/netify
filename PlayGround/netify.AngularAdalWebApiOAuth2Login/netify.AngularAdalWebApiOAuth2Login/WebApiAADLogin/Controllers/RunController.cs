using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace WebApiAADLogin.Controllers
{
    [Authorize]
    public class RunController : ApiController
    {
        [Route("")]
        public IHttpActionResult Get()
        {
            var isAuth = User.Identity.IsAuthenticated;
            var userName = User.Identity.Name;
            var Principal = RequestContext.Principal;
            return Ok(Run.CreateRuns());
        }
    }

    public class Run
    {
        public string Name { get; set; }

        public static List<Run> CreateRuns()
        {
            List<Run> runs = new List<Run>
            {
                new Run { Name = "Dalby"},
                new Run { Name = "Malmö"}
            };
            return runs;
        }
    }

}
