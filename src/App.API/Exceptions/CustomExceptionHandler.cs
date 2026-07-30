using BuildingBlocks.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace App.API.Exceptions;

public class CustomExceptionHandler(ILogger<CustomExceptionHandler> logger, IHostEnvironment environment)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        logger
            .LogError(exception, "Unhandled exception occurred while processing {Path}", context.Request.Path);

        var (statusCode, title, detail) = exception switch
        {
            ValidationException validationException =>
            (
                StatusCodes.Status400BadRequest,
                "Validation Error",
                validationException.Message
            ),
            BadRequestException badRequestException =>
            (
                StatusCodes.Status400BadRequest,
                "Bad Request",
                badRequestException.Message
            ),

            NotFoundException notFoundException =>
            (
                StatusCodes.Status404NotFound,
                "Resource Not Found",
                notFoundException.Message
            ),
            _ =>
            (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                environment.IsDevelopment()
                    ? exception.Message
                    : "An unexpected error occurred."
            )
        };

        context.Response.StatusCode = statusCode;

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        problem.Extensions["traceId"] = context.TraceIdentifier;

        await context.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true;
    }
}   
