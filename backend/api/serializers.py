from rest_framework import serializers


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, value):
        # Validate file extension
        if not value.name.endswith(('.xlsx', '.xls')):
            raise serializers.ValidationError("Only Excel files (.xlsx, .xls) are supported")
        
        # Validate file size (max 10MB)
        if value.size > 10485760:
            raise serializers.ValidationError("File size too large. Maximum size is 10MB.")
        
        return value