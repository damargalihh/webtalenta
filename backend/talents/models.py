from django.db import models
from mahasiswa.models import Mahasiswa

class Talent(models.Model):
    mahasiswa = models.ForeignKey(Mahasiswa, related_name='talents', on_delete=models.CASCADE)
    judul = models.CharField(max_length=100)
    deskripsi = models.TextField()
    link_portfolio = models.URLField(blank=True)

    def __str__(self):
        return f"{self.judul} ({self.mahasiswa.nama})"
