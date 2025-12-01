from django.db import models

class DataSet(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    original_filename = models.CharField(max_length=255)
    file_size = models.IntegerField()
    columns = models.JSONField(default=list)
    record_count = models.IntegerField(default=0)
    area_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Dataset"
        verbose_name_plural = "Datasets"

class AreaAnalysis(models.Model):
    dataset = models.ForeignKey(DataSet, on_delete=models.CASCADE, related_name='analyses')
    area_name = models.CharField(max_length=255)
    analysis_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.area_name} - {self.dataset.name}"
    
    class Meta:
        verbose_name = "Area Analysis"
        verbose_name_plural = "Area Analyses"
        unique_together = ['dataset', 'area_name']

class QueryLog(models.Model):
    query_text = models.TextField()
    area = models.CharField(max_length=255, blank=True, null=True)
    response_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    user_ip = models.GenericIPAddressField(blank=True, null=True)
    
    def __str__(self):
        return f"Query for {self.area} at {self.created_at}"
    
    class Meta:
        verbose_name = "Query Log"
        verbose_name_plural = "Query Logs"
        ordering = ['-created_at']