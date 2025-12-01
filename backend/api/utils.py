import pandas as pd
import numpy as np
import os
import tempfile
from typing import Dict, List, Any, Optional
import json
_current_dataset = None
_dataset_path = None

def load_dataset(path=None):
    """Load dataset from Excel file with proper column handling"""
    global _current_dataset, _dataset_path
    
    try:
        if path and os.path.exists(path):
            print(f"Loading dataset from: {path}")
            df = pd.read_excel(path, engine='openpyxl')
            _dataset_path = path
            print(f"Loaded {len(df)} records from uploaded file")
            
        elif _dataset_path and os.path.exists(_dataset_path):
            print(f"Loading dataset from cached path: {_dataset_path}")
            df = pd.read_excel(_dataset_path, engine='openpyxl')
            
        else:
            print("No dataset available. Please upload an Excel file.")
            return pd.DataFrame()
        if df.empty:
            print("Warning: Loaded dataset is empty")
            return df
        
        original_columns = list(df.columns)
        print(f"Original columns: {original_columns}")
        
        df.columns = [str(col).strip().lower().replace(' ', '_').replace('-', '_') for col in df.columns]
        print(f"Normalized columns: {list(df.columns)}")
        
        if 'year' in df.columns:
            df['year'] = pd.to_numeric(df['year'], errors='coerce').fillna(0).astype(int)
        
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='ignore')
        
        if 'final_location' in df.columns:
            df['final_location'] = df['final_location'].astype(str).str.strip()
        
        print(f"Dataset loaded successfully: {len(df)} records")
        print(f"Sample data:\n{df.head(2)}")
        
        _current_dataset = df
        return df
        
    except Exception as e:
        print(f"Error loading dataset: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()

def get_dataset():
    """Get current dataset, load if not exists"""
    global _current_dataset
    if _current_dataset is None:
        return load_dataset()
    return _current_dataset

def filter_by_area(df, area):
    """Filter dataframe by area/locality"""
    if df.empty:
        print(f"Dataset is empty, cannot filter area: {area}")
        return pd.DataFrame()
        
    area_lower = str(area).lower().strip()
    print(f"Searching for area: '{area}' (searching: '{area_lower}')")
    
    area_columns = ['final_location', 'locality', 'area', 'location']
    
    for col in area_columns:
        if col in df.columns:
            try:
                mask = df[col].astype(str).str.lower().str.contains(area_lower, na=False)
                filtered_df = df[mask]
                if not filtered_df.empty:
                    print(f"Found {len(filtered_df)} records for area '{area}' in column '{col}'")
                    return filtered_df
            except Exception as e:
                print(f"Error filtering by {col}: {e}")
                continue
    
    print(f"No data found for area: {area}")
    return pd.DataFrame()

def get_unique_areas():
    """Get list of unique areas from dataset"""
    try:
        df = get_dataset()
        
        if df.empty:
            print("Dataset is empty, no areas available")
            return []
        
        area_columns = ['final_location', 'locality', 'area', 'location']
        
        for col in area_columns:
            if col in df.columns:
                areas = df[col].dropna().astype(str).str.strip().unique()
                valid_areas = [area for area in areas if area and area != 'nan']
                if valid_areas:
                    print(f"Found {len(valid_areas)} areas in column '{col}'")
                    return sorted(valid_areas)
        
        return []
        
    except Exception as e:
        print(f"Error getting unique areas: {e}")
        return []

def generate_ai_summary(area, df):
    """Generate AI summary using OpenAI or fallback to analysis"""
    try:
        # First, try to use OpenAI if API key is available
        import os
        from openai import OpenAI
        
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key:
            client = OpenAI(api_key=api_key)
            
            # Prepare data for AI
            summary_data = {
                'area': area,
                'total_years': len(df['year'].unique()) if 'year' in df.columns else 0,
                'total_records': len(df),
                'price_trend': "Not available",
                'sales_trend': "Not available"
            }
            
            if 'flat_weighted_average_rate' in df.columns:
                price_data = df['flat_weighted_average_rate'].dropna()
                if len(price_data) > 0:
                    summary_data['avg_price'] = float(price_data.mean())
                    summary_data['min_price'] = float(price_data.min())
                    summary_data['max_price'] = float(price_data.max())
            
            if 'total_sales_igr' in df.columns:
                sales_data = df['total_sales_igr'].dropna()
                if len(sales_data) > 0:
                    summary_data['total_sales'] = float(sales_data.sum())
            
            prompt = f"""
            Analyze this real estate data for {area}:
            {summary_data}
            
            Provide a concise, professional summary (3-4 sentences) highlighting:
            1. Key trends in pricing
            2. Sales performance
            3. Market observations
            4. Any notable patterns
            
            Write in natural, conversational language.
            """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a real estate market analyst."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
    except Exception as e:
        print(f"OpenAI error, using fallback: {e}")
    
    # Fallback to basic analysis
    return generate_basic_summary(area, df)

def generate_basic_summary(area, df):
    """Generate basic summary from data"""
    if df.empty:
        return f"No data available for {area}."
    
    summary_parts = []
    
    # Years covered
    if 'year' in df.columns:
        years = sorted(df['year'].unique())
        if years:
            year_range = f"{min(years)}-{max(years)}" if len(years) > 1 else str(years[0])
            summary_parts.append(f"Analysis covers {year_range} with {len(years)} year(s).")
    
    # Price information
    price_metrics = []
    price_cols = ['flat_weighted_average_rate', 'office_weighted_average_rate', 
                 'shop_weighted_average_rate', 'others_weighted_average_rate']
    
    for col in price_cols:
        if col in df.columns and not df[col].dropna().empty:
            avg_price = df[col].mean()
            price_metrics.append(f"{col.replace('_', ' ').title()}: ₹{avg_price:,.0f}/sqft")
    
    if price_metrics:
        summary_parts.append("Average rates: " + ", ".join(price_metrics))
    
    # Sales information
    if 'total_sales_igr' in df.columns:
        total_sales = df['total_sales_igr'].sum()
        summary_parts.append(f"Total sales: ₹{total_sales:,.0f}")
    
    if 'total_units' in df.columns:
        total_units = df['total_units'].sum()
        summary_parts.append(f"Total units: {total_units:,.0f}")
    
    summary_parts.append(f"Based on {len(df)} data records from uploaded Excel file.")
    
    return " ".join(summary_parts)

def generate_real_summary(area, df):
    """Generate complete analysis summary"""
    try:
        filtered_df = filter_by_area(df, area)
        
        if filtered_df.empty:
            return {
                "summary": f"No data found for area '{area}' in the uploaded file.",
                "years": [],
                "key_metrics": {},
                "data_source": "uploaded_file",
                "ai_summary": f"No data available to analyze {area}."
            }
        
        # Get AI summary
        ai_summary = generate_ai_summary(area, filtered_df)
        
        # Calculate metrics
        years = []
        if 'year' in filtered_df.columns:
            years = sorted(filtered_df['year'].unique())
            years = [int(year) for year in years if not pd.isna(year)]
        
        # Price metrics
        price_data = {}
        price_columns = [
            'flat_weighted_average_rate', 'office_weighted_average_rate',
            'others_weighted_average_rate', 'shop_weighted_average_rate'
        ]
        
        for col in price_columns:
            if col in filtered_df.columns and filtered_df[col].notna().any():
                price_values = filtered_df[col].dropna()
                if len(price_values) > 0:
                    price_data[col] = {
                        'min': float(price_values.min()),
                        'max': float(price_values.max()),
                        'avg': float(price_values.mean()),
                        'count': len(price_values)
                    }
        
        # Sales metrics
        sales_data = {}
        sales_columns = [
            'total_sales_igr', 'total_sold_igr', 'total_units',
            'flat_sold_igr', 'office_sold_igr', 'shop_sold_igr'
        ]
        
        for col in sales_columns:
            if col in filtered_df.columns and filtered_df[col].notna().any():
                sales_values = filtered_df[col].dropna()
                if len(sales_values) > 0:
                    if 'sales' in col.lower():
                        sales_data[col] = {
                            'total': float(sales_values.sum()),
                            'avg': float(sales_values.mean()),
                            'count': len(sales_values)
                        }
                    else:
                        sales_data[col] = {
                            'total': float(sales_values.sum()),
                            'avg': float(sales_values.mean()),
                            'count': len(sales_values)
                        }
        
        return {
            "summary": f"Real estate analysis for {area}",
            "ai_summary": ai_summary,
            "years": years,
            "key_metrics": {
                "price_data": price_data,
                "sales_data": sales_data,
                "record_count": len(filtered_df),
                "area_coverage": f"{min(years)}-{max(years)}" if years else "N/A"
            },
            "data_source": "uploaded_excel_file"
        }
        
    except Exception as e:
        print(f"Error generating summary: {e}")
        return {
            "summary": f"Error analyzing data for {area}.",
            "ai_summary": f"Unable to generate analysis for {area} due to data format issues.",
            "years": [],
            "key_metrics": {},
            "data_source": "error"
        }

def generate_real_chart_data(area, chart_type='price'):
    """Generate chart data from actual uploaded data"""
    try:
        df = get_dataset()
        filtered_df = filter_by_area(df, area)
        
        if filtered_df.empty or 'year' not in filtered_df.columns:
            return {"labels": [], "datasets": [], "data_source": "no_data"}
        
        yearly_data = filtered_df.groupby('year')
        years = sorted(yearly_data.groups.keys())
        
        if chart_type == 'price':
            price_columns = [
                'flat_weighted_average_rate', 'office_weighted_average_rate',
                'shop_weighted_average_rate', 'others_weighted_average_rate'
            ]
            
            datasets = []
            colors = [
                'rgba(59, 130, 246, 0.8)',    
                'rgba(16, 185, 129, 0.8)',    
                'rgba(245, 158, 11, 0.8)',    
                'rgba(239, 68, 68, 0.8)'      
            ]
            
            for i, col in enumerate(price_columns):
                if col in filtered_df.columns:
                    data = []
                    for year in years:
                        year_data = yearly_data.get_group(year)
                        avg_price = year_data[col].mean()
                        data.append(float(avg_price) if not pd.isna(avg_price) else 0)
                    
                    if any(x > 0 for x in data):
                        label_map = {
                            'flat_weighted_average_rate': 'Flat Rate',
                            'office_weighted_average_rate': 'Office Rate',
                            'shop_weighted_average_rate': 'Shop Rate',
                            'others_weighted_average_rate': 'Others Rate'
                        }
                        
                        datasets.append({
                            "label": label_map.get(col, col.replace('_', ' ').title()),
                            "data": data,
                            "borderColor": colors[i % len(colors)],
                            "backgroundColor": colors[i % len(colors)].replace('0.8', '0.2'),
                            "borderWidth": 2,
                            "tension": 0.4
                        })
            
            return {
                "labels": [str(int(year)) for year in years],
                "datasets": datasets,
                "data_source": "uploaded_excel_file"
            }
        
        elif chart_type == 'demand':
            demand_columns = [
                'total_sales_igr', 'total_sold_igr', 'total_units',
                'flat_sold_igr', 'office_sold_igr', 'shop_sold_igr'
            ]
            
            datasets = []
            colors = [
                'rgba(59, 130, 246, 0.8)',    
                'rgba(16, 185, 129, 0.8)',    
                'rgba(245, 158, 11, 0.8)',    
            ]
            
            for i, col in enumerate(demand_columns[:3]):  
                if col in filtered_df.columns:
                    data = []
                    for year in years:
                        year_data = yearly_data.get_group(year)
                        if 'sales' in col.lower():
                            total_value = year_data[col].sum()
                        else:
                            total_value = year_data[col].mean()
                        data.append(float(total_value) if not pd.isna(total_value) else 0)
                    
                    if any(x > 0 for x in data):
                        label_map = {
                            'total_sales_igr': 'Total Sales',
                            'total_sold_igr': 'Properties Sold',
                            'total_units': 'Total Units',
                            'flat_sold_igr': 'Flats Sold',
                            'office_sold_igr': 'Offices Sold',
                            'shop_sold_igr': 'Shops Sold'
                        }
                        
                        datasets.append({
                            "label": label_map.get(col, col.replace('_', ' ').title()),
                            "data": data,
                            "borderColor": colors[i % len(colors)],
                            "backgroundColor": colors[i % len(colors)].replace('0.8', '0.2'),
                            "borderWidth": 2,
                            "tension": 0.4
                        })
            
            return {
                "labels": [str(int(year)) for year in years],
                "datasets": datasets,
                "data_source": "uploaded_excel_file"
            }
        
        elif chart_type == 'composition':
            composition_cols = ['flat_sold_igr', 'office_sold_igr', 'shop_sold_igr', 'others_sold_igr']
            
            latest_year = max(years) if years else None
            if latest_year:
                latest_data = filtered_df[filtered_df['year'] == latest_year]
                
                data = []
                labels = []
                background_colors = [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ]
                
                for i, col in enumerate(composition_cols):
                    if col in latest_data.columns:
                        value = latest_data[col].sum()
                        if value > 0:
                            data.append(float(value))
                            labels.append(col.replace('_sold_igr', '').title())
                
                if data:
                    return {
                        "labels": labels,
                        "datasets": [{
                            "label": f"Property Composition ({latest_year})",
                            "data": data,
                            "backgroundColor": background_colors[:len(data)],
                            "borderWidth": 1
                        }],
                        "data_source": "uploaded_excel_file"
                    }
        
        return {"labels": [], "datasets": [], "data_source": "no_matching_columns"}
        
    except Exception as e:
        print(f"Error generating chart data: {e}")
        import traceback
        traceback.print_exc()
        return {"labels": [], "datasets": [], "data_source": "error"}

def get_real_table_data(area, limit=100, offset=0):
    """Get paginated table data from uploaded file"""
    try:
        df = get_dataset()
        filtered_df = filter_by_area(df, area)
        
        if filtered_df.empty:
            return {"columns": [], "rows": [], "total": 0, "data_source": "no_data"}
        
        filtered_df = filtered_df.reset_index(drop=True)
        
        total = len(filtered_df)
        paginated_df = filtered_df.iloc[offset:offset + limit]
        
        display_columns = [
            'year', 'final_location', 'city', 'total_sales_igr', 'total_units',
            'flat_weighted_average_rate', 'office_weighted_average_rate',
            'shop_weighted_average_rate', 'flat_sold_igr', 'office_sold_igr',
            'shop_sold_igr'
        ]
        
        available_columns = [col for col in display_columns if col in paginated_df.columns]
        if not available_columns:
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
                    if 'rate' in col or 'sales' in col:
                        row_data.append(f"₹{val:,.0f}")
                    else:
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
    """Get information about the current dataset"""
    try:
        df = get_dataset()
        areas = get_unique_areas()
        
        info = {
            "loaded": not df.empty,
            "record_count": len(df),
            "area_count": len(areas),
            "columns": list(df.columns) if not df.empty else [],
            "areas_sample": areas[:5] if areas else [],
            "years_available": sorted(df['year'].unique().tolist()) if 'year' in df.columns and not df.empty else [],
            "data_source": "uploaded_excel_file" if not df.empty else "no_data"
        }
        
        return info
        
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
    """Clear the current dataset"""
    global _current_dataset, _dataset_path
    _current_dataset = None
    _dataset_path = None
    print("Dataset cleared")

def export_data(area, format='csv'):
    """Export filtered data for download"""
    try:
        df = get_dataset()
        filtered_df = filter_by_area(df, area)
        
        if filtered_df.empty:
            return None
        
        if format == 'csv':
            return filtered_df.to_csv(index=False)
        elif format == 'excel':
            import io
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                filtered_df.to_excel(writer, index=False, sheet_name=area[:31])
            output.seek(0)
            return output.getvalue()
        elif format == 'json':
            return filtered_df.to_json(orient='records', date_format='iso')
            
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
            "comparison": {}
        }
        
        # Compare price trends
        price_cols = ['flat_weighted_average_rate', 'office_weighted_average_rate']
        for col in price_cols:
            if col in df1.columns and col in df2.columns:
                avg1 = df1[col].mean()
                avg2 = df2[col].mean()
                diff = ((avg2 - avg1) / avg1 * 100) if avg1 > 0 else 0
                
                comparison["comparison"][col] = {
                    f"{area1}": float(avg1),
                    f"{area2}": float(avg2),
                    "difference_percent": float(diff)
                }
        
        # Compare sales
        if 'total_sales_igr' in df1.columns and 'total_sales_igr' in df2.columns:
            sales1 = df1['total_sales_igr'].sum()
            sales2 = df2['total_sales_igr'].sum()
            diff = ((sales2 - sales1) / sales1 * 100) if sales1 > 0 else 0
            
            comparison["comparison"]["total_sales"] = {
                f"{area1}": float(sales1),
                f"{area2}": float(sales2),
                "difference_percent": float(diff)
            }
        
        return comparison
        
    except Exception as e:
        print(f"Error comparing areas: {e}")
        return {"error": str(e)}