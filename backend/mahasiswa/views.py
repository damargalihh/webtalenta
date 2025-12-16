from rest_framework import generics, filters, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser, AllowAny
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
    filterset_fields = ['prodi', 'fakultas', 'angkatan', 'is_active']
    
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
    
    def create(self, request, *args, **kwargs):
        """Override create to handle both create and update"""
        # Check if user already has a profile
        try:
            existing_profile = Mahasiswa.objects.get(user=request.user)
            print(f"[UPDATE] Profile exists for user: {request.user.username}")
            print(f"[UPDATE] Raw request data keys: {list(request.data.keys())}")
            
            # Filter out empty/None values from request data
            filtered_data = {}
            for key, value in request.data.items():
                if value is not None and value != '':
                    filtered_data[key] = value
                    print(f"[UPDATE] Including field: {key} = {value}")
                else:
                    print(f"[UPDATE] Skipping empty field: {key}")
            
            print(f"[UPDATE] Filtered data keys: {list(filtered_data.keys())}")
            
            # Do PARTIAL UPDATE
            serializer = self.get_serializer(
                existing_profile,
                data=filtered_data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            print(f"[UPDATE] Profile updated successfully")
            return Response(serializer.data)
            
        except Mahasiswa.DoesNotExist:
            print(f"[CREATE] Creating new profile for user: {request.user.username}")
            # Call default create behavior
            return super().create(request, *args, **kwargs)
    
    def perform_update(self, serializer):
        """Called when updating existing profile"""
        mahasiswa = serializer.save()
        
        # Handle skills if provided
        skills_data = self.request.data.get('skills')
        if skills_data:
            import json
            try:
                skills_list = json.loads(skills_data) if isinstance(skills_data, str) else skills_data
                from skills.models import Skill
                # Clear existing and create new
                mahasiswa.skills.all().delete()
                for skill_name in skills_list:
                    if skill_name.strip():
                        Skill.objects.create(mahasiswa=mahasiswa, nama=skill_name.strip())
                print(f"[UPDATE] Created {len(skills_list)} skills")
            except (json.JSONDecodeError, TypeError) as e:
                print(f"[UPDATE] Error parsing skills: {e}")
        
        # Handle pengalaman if provided
        pengalaman_data = self.request.data.get('pengalaman')
        if pengalaman_data:
            import json
            try:
                pengalaman_list = json.loads(pengalaman_data) if isinstance(pengalaman_data, str) else pengalaman_data
                from .models import Pengalaman
                # Clear existing and create new
                mahasiswa.pengalaman.all().delete()
                for exp in pengalaman_list:
                    if exp.get('posisi') and exp.get('organisasi'):
                        Pengalaman.objects.create(
                            mahasiswa=mahasiswa,
                            posisi=exp.get('posisi', ''),
                            organisasi=exp.get('organisasi', ''),
                            tahun_mulai=exp.get('tahun_mulai', ''),
                            tahun_selesai=exp.get('tahun_selesai', ''),
                            deskripsi=exp.get('deskripsi', '')
                        )
                print(f"[UPDATE] Created {len(pengalaman_list)} pengalaman entries")
            except (json.JSONDecodeError, TypeError) as e:
                print(f"[UPDATE] Error parsing pengalaman: {e}")

    def perform_create(self, serializer):
        # Check if user already has a profile
        try:
            existing_profile = Mahasiswa.objects.get(user=self.request.user)
            print(f"[UPDATE] Profile exists for user: {self.request.user.username}")
            print(f"[UPDATE] Raw request data keys: {list(self.request.data.keys())}")
            
            # Filter out empty/None values from request data
            # Only send non-empty fields to serializer
            filtered_data = {}
            for key, value in self.request.data.items():
                if value is not None and value != '':
                    filtered_data[key] = value
                    print(f"[UPDATE] Including field: {key} = {value}")
                else:
                    print(f"[UPDATE] Skipping empty field: {key}")
            
            print(f"[UPDATE] Filtered data keys: {list(filtered_data.keys())}")
            
            # If profile exists, do PARTIAL UPDATE
            # Use serializer with partial=True to allow updating only changed fields
            update_serializer = MahasiswaSerializer(
                existing_profile,
                data=filtered_data,  # Use filtered data
                partial=True,  # Allow partial updates
                context={'request': self.request}
            )
            
            if not update_serializer.is_valid():
                print(f"[UPDATE] Validation errors: {update_serializer.errors}")
                raise serializers.ValidationError(update_serializer.errors)
            
            mahasiswa = update_serializer.save()
            print(f"[UPDATE] Profile updated successfully: {mahasiswa.id}")
            
        except Mahasiswa.DoesNotExist:
            print(f"[CREATE] Creating new profile for user: {self.request.user.username}")
            # Create new profile
            mahasiswa = serializer.save(user=self.request.user)
            print(f"[CREATE] Profile created successfully: {mahasiswa.id}")
        
        # Handle skills if provided
        skills_data = self.request.data.get('skills')
        if skills_data:
            import json
            try:
                skills_list = json.loads(skills_data) if isinstance(skills_data, str) else skills_data
                from skills.models import Skill
                # Clear existing and create new
                mahasiswa.skills.all().delete()
                for skill_name in skills_list:
                    if skill_name.strip():
                        Skill.objects.create(mahasiswa=mahasiswa, nama=skill_name.strip())
            except (json.JSONDecodeError, TypeError):
                pass
        
        # Handle pengalaman if provided
        pengalaman_data = self.request.data.get('pengalaman')
        if pengalaman_data:
            import json
            try:
                pengalaman_list = json.loads(pengalaman_data) if isinstance(pengalaman_data, str) else pengalaman_data
                from .models import Pengalaman
                # Clear existing and create new
                mahasiswa.pengalaman.all().delete()
                for exp in pengalaman_list:
                    if exp.get('posisi') and exp.get('organisasi'):
                        Pengalaman.objects.create(
                            mahasiswa=mahasiswa,
                            posisi=exp.get('posisi', ''),
                            organisasi=exp.get('organisasi', ''),
                            tahun_mulai=exp.get('tahun_mulai', ''),
                            tahun_selesai=exp.get('tahun_selesai', ''),
                            deskripsi=exp.get('deskripsi', '')
                        )
                print(f"[CREATE] Created {len(pengalaman_list)} pengalaman entries")
            except (json.JSONDecodeError, TypeError) as e:
                print(f"[CREATE] Error parsing pengalaman: {e}")


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
        """Get profile detail without incrementing views (use dedicated track_profile_view endpoint)"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_update(self, serializer):
        # Only allow user to update their own profile
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own profile")
        
        mahasiswa = serializer.save()
        
        # Handle skills update if provided
        skills_data = self.request.data.get('skills')
        if skills_data:
            import json
            try:
                skills_list = json.loads(skills_data) if isinstance(skills_data, str) else skills_data
                from skills.models import Skill
                # Clear existing skills and create new ones
                mahasiswa.skills.all().delete()
                for skill_name in skills_list:
                    if skill_name.strip():
                        Skill.objects.create(mahasiswa=mahasiswa, nama=skill_name.strip())
            except (json.JSONDecodeError, TypeError):
                pass
        
        # Handle pengalaman update if provided
        pengalaman_data = self.request.data.get('pengalaman')
        if pengalaman_data:
            import json
            try:
                pengalaman_list = json.loads(pengalaman_data) if isinstance(pengalaman_data, str) else pengalaman_data
                # Handle pengalaman updates here if model exists
            except (json.JSONDecodeError, TypeError):
                pass
    
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


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def generate_qr_code(request, pk):
    """Generate QR Code for mahasiswa profile"""
    try:
        mahasiswa = Mahasiswa.objects.get(pk=pk)
        
        # Build the profile URL (adjust based on your frontend URL)
        # You can get the base URL from settings or request
        base_url = request.build_absolute_uri('/')[:-1]  # Remove trailing slash
        profile_url = f"{base_url}/talent/{pk}"
        
        # Generate QR Code
        import qrcode
        import io
        import base64
        from django.http import HttpResponse
        
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(profile_url)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Check if user wants to download or get base64
        download = request.GET.get('download', 'false').lower() == 'true'
        
        if download:
            # Return as downloadable PNG file
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            response = HttpResponse(buffer, content_type='image/png')
            response['Content-Disposition'] = f'attachment; filename="qrcode_{mahasiswa.nama}_{pk}.png"'
            return response
        else:
            # Return as base64 encoded JSON
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return Response({
                'qr_code': f'data:image/png;base64,{img_base64}',
                'profile_url': profile_url,
                'mahasiswa_nama': mahasiswa.nama,
                'mahasiswa_id': pk
            })
            
    except Mahasiswa.DoesNotExist:
        return Response({'error': 'Mahasiswa not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)