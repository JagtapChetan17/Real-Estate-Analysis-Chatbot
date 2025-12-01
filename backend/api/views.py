import os
import tempfile
import json
import pandas as pd
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse, JsonResponse
from .utils import (
    load_dataset, get_unique_areas, generate_real_summary, 
    generate_real_chart_data, get_real_table_data, get_dataset,
    get_dataset_info, clear_dataset, export_data, compare_areas, filter_by_area
)
from .serializers import FileUploadSerializer


class UploadView(APIView):
    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        
        if serializer.is_valid():
            file = serializer.validated_data['file']
            
            # Validate file type
            if not file.name.endswith(('.xlsx', '.xls')):
                return Response(
                    {"error": "Only Excel files (.xlsx, .xls) are supported"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file size (max 10MB)
            if file.size > 10485760:
                return Response(
                    {"error": "File size too large. Maximum size is 10MB."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Create temporary file
                file_extension = os.path.splitext(file.name)[1]
                with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                    for chunk in file.chunks():
                        temp_file.write(chunk)
                    temp_path = temp_file.name
                
                print(f"📁 Uploading file: {file.name}")
                
                # Load dataset from uploaded file
                df = load_dataset(temp_path)
                areas = get_unique_areas()
                
                # Clean up temp file
                try:
                    os.unlink(temp_path)
                    print(f"🗑️ Temporary file deleted: {temp_path}")
                except Exception as e:
                    print(f"⚠️ Could not delete temp file: {e}")
                
                if df.empty:
                    return Response(
                        {"error": "The uploaded file is empty or could not be parsed. Please check the file format."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                return Response({
                    "status": "success",
                    "message": f"File '{file.name}' uploaded successfully.",
                    "areas": areas,
                    "record_count": len(df),
                    "columns_found": list(df.columns),
                    "data_source": "uploaded_excel_file"
                })
                
            except Exception as e:
                # Clean up temp file if it exists
                if 'temp_path' in locals():
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                
                error_message = str(e)
                return Response(
                    {"error": f"Error parsing Excel file: {error_message}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AreasView(APIView):
    def get(self, request):
        try:
            areas = get_unique_areas()
            return Response({
                "areas": areas,
                "data_source": "uploaded_excel_file" if areas else "no_data"
            })
        except Exception as e:
            return Response(
                {"error": f"Error loading areas: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnalyzeView(APIView):
    def get(self, request):
        area = request.GET.get('area', '').strip()
        
        if not area:
            return Response(
                {"error": "Area parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            df = get_dataset()
            if df.empty:
                return Response({
                    "error": "No dataset loaded. Please upload an Excel file first.",
                    "data_source": "no_data"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            analysis = generate_real_summary(area, df)
            return Response(analysis)
        except Exception as e:
            return Response(
                {"error": f"Error analyzing data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChartView(APIView):
    def get(self, request):
        area = request.GET.get('area', '').strip()
        chart_type = request.GET.get('type', 'price')
        
        if not area:
            return Response(
                {"error": "Area parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            chart_data = generate_real_chart_data(area, chart_type)
            return Response(chart_data)
        except Exception as e:
            return Response(
                {"error": f"Error generating chart data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TableView(APIView):
    def get(self, request):
        area = request.GET.get('area', '').strip()
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))
        
        if not area:
            return Response(
                {"error": "Area parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            table_data = get_real_table_data(area, limit, offset)
            return Response(table_data)
        except Exception as e:
            return Response(
                {"error": f"Error getting table data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExportView(APIView):
    def get(self, request):
        area = request.GET.get('area', '').strip()
        format = request.GET.get('format', 'csv').lower()
        
        if not area:
            return Response(
                {"error": "Area parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            df = get_dataset()
            filtered_df = filter_by_area(df, area)
            
            if filtered_df.empty:
                return Response(
                    {"error": f"No data found for area: {area}"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Reset index and clean column names for export
            filtered_df = filtered_df.reset_index(drop=True)
            
            if format == 'csv':
                csv_data = filtered_df.to_csv(index=False, encoding='utf-8-sig')
                response = HttpResponse(csv_data, content_type='text/csv; charset=utf-8')
                response['Content-Disposition'] = f'attachment; filename="{area}_data.csv"'
                return response
                
            elif format == 'excel':
                output = io.BytesIO()
                with pd.ExcelWriter(output, engine='openpyxl') as writer:
                    sheet_name = ''.join(c for c in area[:25] if c.isalnum() or c in (' ', '_')).strip() or 'data'
                    filtered_df.to_excel(writer, index=False, sheet_name=sheet_name)
                
                output.seek(0)
                response = HttpResponse(
                    output.read(),
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = f'attachment; filename="{area}_data.xlsx"'
                return response
                
            elif format == 'json':
                json_data = filtered_df.to_json(orient='records', date_format='iso', default_handler=str)
                data = json.loads(json_data)
                return JsonResponse(data, safe=False, json_dumps_params={'indent': 2})
                
            else:
                return Response(
                    {"error": "Invalid format. Supported formats: csv, excel, json"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return Response(
                {"error": f"Error exporting data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CompareView(APIView):
    def get(self, request):
        area1 = request.GET.get('area1', '').strip()
        area2 = request.GET.get('area2', '').strip()
        
        if not area1 or not area2:
            return Response(
                {"error": "Both area1 and area2 parameters are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            comparison = compare_areas(area1, area2)
            return Response(comparison)
        except Exception as e:
            return Response(
                {"error": f"Error comparing areas: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DatasetInfoView(APIView):
    def get(self, request):
        try:
            info = get_dataset_info()
            return Response(info)
        except Exception as e:
            return Response(
                {"error": f"Error getting dataset info: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ClearDatasetView(APIView):
    def post(self, request):
        try:
            clear_dataset()
            return Response({"status": "success", "message": "Dataset cleared successfully"})
        except Exception as e:
            return Response(
                {"error": f"Error clearing dataset: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthCheckView(APIView):
    def get(self, request):
        try:
            df = get_dataset()
            areas_count = len(get_unique_areas())
            
            return Response({
                "status": "healthy", 
                "service": "Real Estate Analysis API",
                "dataset_loaded": not df.empty,
                "areas_count": areas_count,
                "records_count": len(df) if not df.empty else 0,
                "data_source": "uploaded_excel_file" if not df.empty else "no_data",
                "openai_available": os.getenv('OPENAI_API_KEY') is not None
            })
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )