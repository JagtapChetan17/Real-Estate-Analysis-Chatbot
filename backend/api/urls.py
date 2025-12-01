from django.urls import path
from .views import (
    UploadView, AreasView, AnalyzeView, 
    ChartView, TableView, HealthCheckView,
    DatasetInfoView, ClearDatasetView, ExportView,
    CompareView
)
urlpatterns = [
    path('upload/', UploadView.as_view(), name='upload'),
    path('areas/', AreasView.as_view(), name='areas'),
    path('analyze/', AnalyzeView.as_view(), name='analyze'),
    path('chart/', ChartView.as_view(), name='chart'),
    path('table/', TableView.as_view(), name='table'),
    path('export/', ExportView.as_view(), name='export'),
    path('compare/', CompareView.as_view(), name='compare'),
    path('dataset-info/', DatasetInfoView.as_view(), name='dataset-info'),
    path('clear-dataset/', ClearDatasetView.as_view(), name='clear-dataset'),
    path('health/', HealthCheckView.as_view(), name='health'),
]