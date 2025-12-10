from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Mahasiswa
from .serializers import MahasiswaSerializer, MahasiswaListSerializer

class MahasiswaListCreateView(generics.ListCreateAPIView):
    """
    GET: List semua mahasiswa (public, dengan filter & search)
    POST: Create mahasiswa profile (authenticated)
    """
    queryset = Mahasiswa.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter by fields
    filterset_fields = ['prodi', 'fakultas', 'is_active']
    
    # Search by fields
    search_fields = ['nama', 'nim', 'prodi', 'bio', 'skills__nama']
    
    # Order by fields
    ordering_fields = ['nama', 'nim', 'created_at', 'views_count']
    ordering = ['-created_at']  # Default ordering: newest first
    
    def get_serializer_class(self):
        """Use lighter serializer for list view"""
        if self.request.method == 'GET':
            return MahasiswaListSerializer
        return MahasiswaSerializer

    def perform_create(self, serializer):
        # Automatically set user when creating mahasiswa profile
        serializer.save(user=self.request.user)


class MahasiswaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Detail mahasiswa (increment views)
    PUT/PATCH: Update mahasiswa (own profile only)
    DELETE: Delete mahasiswa (own profile only)
    """
    queryset = Mahasiswa.objects.all()
    serializer_class = MahasiswaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when profile is viewed"""
        instance = self.get_object()
        # Only increment if not viewing own profile
        if not request.user.is_authenticated or request.user != instance.user:
            instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_update(self, serializer):
        # Only allow user to update their own profile
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own profile")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow user to delete their own profile
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own profile")
        instance.delete()


class MahasiswaLatestView(generics.ListAPIView):
    """Get 5 latest active mahasiswa profiles for homepage"""
    queryset = Mahasiswa.objects.filter(is_active=True).order_by('-created_at')[:5]
    serializer_class = MahasiswaListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class MahasiswaMostViewedView(generics.ListAPIView):
    """Get most viewed mahasiswa profiles"""
    queryset = Mahasiswa.objects.filter(is_active=True).order_by('-views_count')[:10]
    serializer_class = MahasiswaListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_mahasiswa_status(request, pk):
    """Admin endpoint to activate/deactivate mahasiswa profile"""
    try:
        mahasiswa = Mahasiswa.objects.get(pk=pk)
        mahasiswa.is_active = not mahasiswa.is_active
        mahasiswa.save()
        return Response({
            'message': f'Profile {"activated" if mahasiswa.is_active else "deactivated"} successfully',
            'is_active': mahasiswa.is_active
        })
    except Mahasiswa.DoesNotExist:
        return Response({'error': 'Mahasiswa not found'}, status=status.HTTP_404_NOT_FOUND)