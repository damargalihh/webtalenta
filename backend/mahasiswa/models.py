from django.db import models
from django.contrib.auth.models import User

class Mahasiswa(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nama = models.CharField(max_length=100)
    nim = models.CharField(max_length=20, unique=True)
    prodi = models.CharField(max_length=100)
    fakultas = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    foto_profil = models.ImageField(upload_to='profil/', blank=True, null=True)
    bio = models.TextField(blank=True)
    tanggal_lahir = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)   

    def __str__(self):
        return self.nama