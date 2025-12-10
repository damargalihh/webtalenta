from rest_framework import serializers
from .models import Mahasiswa
from skills.serializers import SkillSerializer
from talents.serializers import TalentSerializer

class MahasiswaSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    talents = TalentSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Mahasiswa
        fields = [
            'id', 'user', 'username', 'nama', 'nim', 'prodi', 'fakultas',
            'email', 'foto_profil', 'bio', 'tanggal_lahir', 'is_active',
            'linkedin', 'github', 'instagram',
            'skills', 'talents', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

class MahasiswaListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    skills_count = serializers.SerializerMethodField()
    talents_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Mahasiswa
        fields = [
            'id', 'nama', 'nim', 'prodi', 'fakultas', 'email',
            'foto_profil', 'bio', 'is_active', 'skills_count', 
            'talents_count', 'created_at'
        ]
    
    def get_skills_count(self, obj):
        return obj.skills.count()
    
    def get_talents_count(self, obj):
        return obj.talents.count()