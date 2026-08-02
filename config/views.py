from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health_check(_request):
    """Lightweight liveness endpoint for local and deployment probes."""
    return JsonResponse({'status': 'ok'})
