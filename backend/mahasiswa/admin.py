from django.contrib import admin
from .models import Mahasiswa

@admin.register(Mahasiswa)
class MahasiswaAdmin(admin.ModelAdmin):
    list_display = ['nama', 'nim', 'prodi', 'email', 'is_active', 'created_at']
    list_filter = ['prodi', 'fakultas', 'is_active']
    search_fields = ['nama', 'nim', 'email', 'prodi']
    list_editable = ['is_active']
    date_hierarchy = 'created_at'
