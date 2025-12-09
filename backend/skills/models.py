from django.db import models
from mahasiswa.models import Mahasiswa

class Skill(models.Model):
    mahasiswa = models.ForeignKey(Mahasiswa, related_name='skills', on_delete=models.CASCADE)
    nama = models.CharField(max_length=100)
    level = models.CharField(max_length=50, blank=True)  # contoh: Beginner, Intermediate, Expert

    def __str__(self):
        return f"{self.nama} ({self.mahasiswa.nama})"