from rest_framework import generics
from .models import Mahasiswa
from .serializers import MahasiswaSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class MahasiswaListCreateView(generics.ListCreateAPIView):
    queryset = Mahasiswa.objects.all()
    serializer_class = MahasiswaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class MahasiswaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Mahasiswa.objects.all()
    serializer_class = MahasiswaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
