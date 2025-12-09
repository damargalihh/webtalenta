from django.urls import path
from . import views

urlpatterns = [
    path('', views.MahasiswaListCreateView.as_view(), name='mahasiswa-list'),
    path('<int:pk>/', views.MahasiswaDetailView.as_view(), name='mahasiswa-detail'),
]
