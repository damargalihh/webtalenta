from django.urls import path
from . import views

urlpatterns = [
    path('', views.SkillListCreateView.as_view(), name='skill-list'),
    path('<int:pk>/', views.SkillDetailView.as_view(), name='skill-detail'),
]
