# map_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.map_view, name='map_view'),
    path('save-polygon/', views.save_polygon, name='save_polygon'),
]