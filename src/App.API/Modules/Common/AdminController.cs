using Identity.Core.Constants;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Modules.Common;

[ApiController]
[Authorize(Roles = Roles.Admin)]
[Route("api/admin/[controller]")]
public class AdminController : ControllerBase
{
}
