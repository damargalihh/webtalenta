from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI Schema
schema_view = get_schema_view(
    openapi.Info(
        title="Talenta Mahasiswa UMS API",
        default_version='v1',
        description="""
        API Documentation untuk Aplikasi Talenta Mahasiswa UMS
        
        Platform untuk menampilkan profil, skill, dan portofolio mahasiswa UMS.
        
        ## Features:
        - Authentication (JWT)
        - Mahasiswa Profile Management
        - Skills Management
        - Portfolio/Talents Management
        - CV Download (PDF)
        - Public Browse & Search
        """,
        terms_of_service="https://www.talenta-ums.com/terms/",
        contact=openapi.Contact(email="admin@ums.ac.id"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/accounts/', include('accounts.urls')),
    path('api/mahasiswa/', include('mahasiswa.urls')),
    path('api/skills/', include('skills.urls')),
    path('api/talents/', include('talents.urls')),
    
    # API Documentation
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='api-root'),  # Root URL shows Swagger
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)