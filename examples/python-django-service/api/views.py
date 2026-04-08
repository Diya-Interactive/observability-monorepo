"""
Views for the example API
"""

from django.http import JsonResponse
from your_org_observability.logger import default_logger


def users_list(request):
    """List all users"""
    default_logger.info('Fetching users list', route='/api/users/')
    
    return JsonResponse([
        {'id': 1, 'name': 'Alice'},
        {'id': 2, 'name': 'Bob'},
    ], safe=False)


def users_detail(request, user_id):
    """Get user by ID"""
    default_logger.info(
        f'Fetching user {user_id}',
        user_id=str(user_id),
        route=f'/api/users/{user_id}/',
    )
    
    return JsonResponse({'id': user_id, 'name': f'User {user_id}'})


def users_create(request):
    """Create new user"""
    if request.method != 'POST':
        default_logger.warn('Invalid method for user creation', route='/api/users/create/')
        return JsonResponse({'error': 'POST required'}, status=400)
    
    import json
    try:
        data = json.loads(request.body)
        name = data.get('name')
        
        if not name:
            default_logger.warn('User creation failed - missing name', route='/api/users/create/')
            return JsonResponse({'error': 'Name required'}, status=400)
        
        default_logger.info('User created successfully', route='/api/users/create/')
        return JsonResponse({'id': 3, 'name': name}, status=201)
    except Exception as e:
        default_logger.error(f'User creation error: {str(e)}', route='/api/users/create/')
        return JsonResponse({'error': 'Internal error'}, status=500)


def trigger_error(request):
    """Intentional error for testing"""
    default_logger.info('Triggering test error', route='/api/error/')
    raise Exception('Intentional test error')
