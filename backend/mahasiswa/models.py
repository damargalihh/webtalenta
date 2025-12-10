from django.db import models
from django.contrib.auth.models import User

class Mahasiswa(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mahasiswa_profile')
    nama = models.CharField(max_length=100)
    nim = models.CharField(max_length=20, unique=True)
    prodi = models.CharField(max_length=100)
    fakultas = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    telepon = models.CharField(max_length=20, blank=True)
    alamat = models.TextField(blank=True)
    foto_profil = models.ImageField(upload_to='profil/', blank=True, null=True)
    bio = models.TextField(blank=True, help_text="Deskripsi singkat tentang diri")
    tanggal_lahir = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Profil aktif/nonaktif")
    
    # Social media links
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True, help_text="Personal website/portfolio")
    
    # Statistics
    views_count = models.IntegerField(default=0, help_text="Jumlah profile views")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mahasiswa'
        verbose_name_plural = 'Mahasiswa'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['prodi']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.nama} ({self.nim})"
    
    def increment_views(self):
        """Increment profile view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])