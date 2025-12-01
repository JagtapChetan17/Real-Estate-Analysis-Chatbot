import pandas as pd
import numpy as np
import os
import json
from io import BytesIO

# Global variable to store the current dataset
_current_dataset = None
_dataset_path = None

def load_dataset(path=None):
    """Load dataset from Excel file"""
    global _current_dataset, _dataset_path
    
    try:
        if path and os.path.exists(path):
            print(f"Loading dataset from: {path}")
            df = pd.read_excel(path, engine='openpyxl')
            _dataset_path = path
        elif _dataset_path and os.path.exists(_dataset_path):
            df = pd.read_excel(_dataset_path, engine='openpyxl')
        else:
            return pd.DataFrame()
        
        # Basic validation
        if df.empty:
            return df
        
        # Normalize column names
        df.columns = [str(col).strip().lower().replace(' ', '_').replace('-', '_') for col in df.columns]
        
        # Clean numeric data
        for col in df.columns:
            if df[col].dtype == 'object':
                try:
                    df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='ignore')
                except:
                    pass
        
        _current_dataset = df
        return df
        
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return pd.DataFrame()

def get_dataset():
    """Get current dataset"""
    global _current_dataset
    if _current_dataset is None:
        return load_dataset()
    return _current_dataset

def filter_by_area(df, area):
    """Filter dataframe by area"""
    if df.empty:
        return pd.DataFrame()
    
    area_lower = str(area).lower().strip()
    area_columns = ['final_location', 'locality', 'area', 'location', 'city']
    
    for col in area_columns:
        if col in df.columns:
            try:
                mask = df[col].astype(str).str.lower().str.contains(area_lower, na=False)
                filtered_df = df[mask]
                if not filtered_df.empty:
                    return filtered_df
            except:
                continue
    
    return pd.DataFrame()

def get_unique_areas():
    """Get list of unique areas"""
    try:
        df = get_dataset()
        
        if df.empty:
            return []
        
        area_columns = ['final_location', 'locality', 'area', 'location', 'city']
        
        for col in area_columns:
            if col in df.columns:
                areas = df[col].dropna().astype(str).str.strip().unique()
                valid_areas = [area for area in areas if area and area.lower() != 'nan']
                if valid_areas:
                    return sorted(valid_areas)
        
        return []
    except Exception as e:
        print(f"Error getting unique areas: {e}")
        return []

def generate_real_summary(area, df):
    """Generate complete analysis summary"""
    try:
        filtered_df = filter_by_area(df, area)
        
        if filtered_df.empty:
            return {
                "summary": f"No data found for area '{area}'.",
                "years": [],
                "key_metrics": {},
                "data_source": "uploaded_file",
                "ai_summary": f"No data available for {area}."
            }
        
        # Get AI summary if available
        ai_summary = "Analysis generated from uploaded data."
        
        # Calculate years
        years = []
        if 'year' in filtered_df.columns:
            years = sorted([int(y) for y in filtered_df['year'].unique() if not pd.isna(y)])
        
        # Calculate metrics
        price_data = {}
        price_columns = ['flat_weighted_average_rate', 'office_weighted_average_rate']
        for col in price_columns:
            if col in filtered_df.columns and not filtered_df[col].dropna().empty:
                price_values = filtered_df[col].dropna()
                if len(price_values) > 0:
                    price_data[col] = {
                        'min': float(price_values.min()),
                        'max': float(price_values.max()),
                        'avg': float(price_values.mean()),
                        'count': len(price_values)
                    }
        
        return {
            "summary": f"Real estate analysis for {area}",
            "ai_summary": ai_summary,
            "years": years,
            "key_metrics": {
                "price_data": price_data,
                "record_count": len(filtered_df),
                "area_coverage": f"{min(years)}-{max(years)}" if years else "N/A"
            },
            "data_source": "uploaded_excel_file"
        }
        
    except Exception as e:
        print(f"Error generating summary: {e}")
        return {
            "summary": f"Error analyzing data for {area}.",
            "ai_summary": "Unable to generate analysis.",
            "years": [],
            "key_metrics": {},
            "data_source": "error"
        }

def generate_real_chart_data(area, chart_type='price'):
    """Generate chart data"""
    try:
        df = get_dataset()
        filtered_df = filter_by_area(df, area)
        
        if filtered_df.empty or 'year' not in filtered_df.columns:
            return {"labels": [], "datasets": [], "data_source": "no_data"}
        
        yearly_data = filtered_df.groupby('year')
        years = sorted(yearly_data.groups.keys())
        
        if chart_type == 'price':
            datasets = []
            colors = ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)']
            price_columns = ['flat_weighted_average_rate', 'office_weighted_average_rate']
            
            for i, col in enumerate(price_columns):
                if col in filtered_df.columns:
                    data = []
                    for year in years:
                        year_data = yearly_data.get_group(year)
                        avg_price = year_data[col].mean()
                        data.append(float(avg_price) if not pd.isna(avg_price) else 0)
                    
                    if any(x > 0 for x in data):
                        datasets.append({
                            "label": col.replace('_', ' ').title(),
                            "data": data,
                            "borderColor": colors[i % len(colors)],
                            "backgroundColor": colors[i % len(colors)].replace('0.8', '0.2'),
                            "borderWidth": 2
                        })
            
            return {
                "labels": [str(int(year)) for year in years],
                "datasets": datasets,
                "data_source": "uploaded_excel_file"
            }
        
        return {"labels": [], "datasets": [], "data_source": "no_matching_columns"}
        
    except Exception as e:
        print(f"Error generating chart data: {e}")
        return {"labels": [], "datasets": [], "data_source": "error"}

def get_real_table_data(area, limit=100, offset=0):
    """Get paginated table data"""
    try:
        df = get_dataset()
        filtered_df = filter_by_area(df, area)
        
        if filtered_df.empty:
            return {"columns": [], "rows": [], "total": 0, "data_source": "no_data"}
        
        total = len(filtered_df)
        paginated_df = filtered_df.iloc[offset:offset + limit]
        
        # Use available columns
        available_columns = list(paginated_df.columns)[:10]
        columns = [col.replace('_', ' ').title() for col in available_columns]
        rows = []
        
        for _, row in paginated_df.iterrows():
            row_data = []
            for col in available_columns:
                val = row[col]
                if pd.isna(val):
                    row_data.append("N/A")
                elif isinstance(val, (np.integer)):
                    row_data.append(int(val))
                elif isinstance(val, (np.floating)):
                    row_data.append(f"{val:,.0f}")
                else:
                    row_data.append(str(val))
            rows.append(row_data)
        
        return {
            "columns": columns,
            "rows": rows,
            "total": total,
            "data_source": "uploaded_excel_file"
        }
        
    except Exception as e:
        print(f"Error getting table data: {e}")
        return {"columns": [], "rows": [], "total": 0, "data_source": "error"}

def get_dataset_info():
    """Get dataset information"""
    try:
        df = get_dataset()
        areas = get_unique_areas()
        
        return {
            "loaded": not df.empty,
            "record_count": len(df),
            "area_count": len(areas),
            "columns": list(df.columns) if not df.empty else [],
            "areas_sample": areas[:5] if areas else [],
            "years_available": sorted(df['year'].unique().tolist()) if 'year' in df.columns and not df.empty else [],
            "data_source": "uploaded_excel_file" if not df.empty else "no_data"
        }
        
    except Exception as e:
        print(f"Error getting dataset info: {e}")
        return {
            "loaded": False,
            "record_count": 0,
            "area_count": 0,
            "columns": [],
            "areas_sample": [],
            "years_available": [],
            "data_source": "error"
        }

def clear_dataset():
    """Clear dataset"""
    global _current_dataset, _dataset_path
    _current_dataset = None
    _dataset_path = None
    print("Dataset cleared")

def export_data(area, format='csv'):
    """Export filtered data"""
    try:
        df = get_dataset()
        filtered_df = filter_by_area(df, area)
        
        if filtered_df.empty:
            return None
        
        if format == 'csv':
            return filtered_df.to_csv(index=False)
        elif format == 'excel':
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                filtered_df.to_excel(writer, index=False, sheet_name=area[:31])
            output.seek(0)
            return output.getvalue()
        elif format == 'json':
            return filtered_df.to_json(orient='records', date_format='iso')
        else:
            return None
            
    except Exception as e:
        print(f"Error exporting data: {e}")
        return None

def compare_areas(area1, area2):
    """Compare two areas"""
    try:
        df = get_dataset()
        df1 = filter_by_area(df, area1)
        df2 = filter_by_area(df, area2)
        
        if df1.empty or df2.empty:
            return {"error": "One or both areas not found"}
        
        comparison = {
            "area1": area1,
            "area2": area2,
            "comparison": {
                "record_count": {
                    area1: len(df1),
                    area2: len(df2)
                }
            }
        }
        
        return comparison
        
    except Exception as e:
        print(f"Error comparing areas: {e}")
        return {"error": str(e)}