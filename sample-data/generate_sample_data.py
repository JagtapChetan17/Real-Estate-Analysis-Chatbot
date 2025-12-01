import pandas as pd
import numpy as np
from datetime import datetime

# Generate sample real estate data
np.random.seed(42)

areas = ['Wakad', 'Akurdi', 'Hinjawadi', 'Pimple Saudagar', 'Baner', 'Aundh', 'Kharadi', 'Viman Nagar']
years = [2020, 2021, 2022, 2023, 2024]

data = []
for area in areas:
    base_price = np.random.randint(8000, 12000)
    base_sales = np.random.randint(10000000, 20000000)
    
    for year in years:
        # Simulate price growth
        price_growth = 1 + (year - 2020) * 0.08 + np.random.normal(0, 0.02)
        current_price = base_price * price_growth
        
        # Simulate sales volume with some randomness
        sales_growth = 1 + (year - 2020) * 0.05 + np.random.normal(0, 0.1)
        current_sales = base_sales * sales_growth
        
        # Simulate units sold
        units = np.random.randint(30, 100)
        
        data.append({
            'year': year,
            'area': area,
            'city': 'Pune',
            'total_sales': int(current_sales),
            'total_units': units,
            'flat_weighted_average_rate': round(current_price, 2),
            'office_weighted_average_rate': round(current_price * 1.3, 2),
            'demand_index': np.random.randint(70, 95),
            'supply_units': np.random.randint(50, 150)
        })

df = pd.DataFrame(data)

# Save to Excel
with pd.ExcelWriter('realestate_sample.xlsx', engine='openpyxl') as writer:
    df.to_excel(writer, sheet_name='RealEstateData', index=False)

print("Sample data generated: realestate_sample.xlsx")
print(f"Records: {len(df)}")
print(f"Areas: {areas}")
print(f"Years: {years}")