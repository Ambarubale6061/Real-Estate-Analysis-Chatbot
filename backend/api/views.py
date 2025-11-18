import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os

def generate_mock_summary(locality, avg_price, trend):
    return (
        f"Real Estate Analysis for {locality}: The data indicates a {trend} trend "
        f"in recent years. The average price currently sits around ₹{avg_price:.2f} per sqft. "
        f"Demand remains robust relative to supply."
    )

class RealEstateAnalyzeView(APIView):
    def post(self, request):
        query = request.data.get('query', '').lower()

        # Load Excel file from project root
        file_path = os.path.join(settings.BASE_DIR, 'data.xlsx')

        try:
            df = pd.read_excel(file_path)
        except FileNotFoundError:
            return Response({"error": "Dataset not found on server"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Failed to read dataset: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Normalize columns
        df.columns = [c.lower().replace(' ', '_') for c in df.columns]

        if 'locality' not in df.columns:
            return Response({"error": "Expected column 'Locality' not found in dataset."}, status=status.HTTP_400_BAD_REQUEST)

        localities = df['locality'].dropna().unique()
        target_locality = None
        for loc in localities:
            if str(loc).lower() in query:
                target_locality = loc
                break

        if not target_locality:
            return Response({
                "summary": "Could not find that locality in the database.",
                "data": []
            }, status=status.HTTP_200_OK)

        filtered_df = df[df['locality'] == target_locality]

        data_records = filtered_df.to_dict('records')

        avg_price = filtered_df['price_per_sqft'].mean() if 'price_per_sqft' in filtered_df.columns else 0

        sorted_df = filtered_df.sort_values('year') if 'year' in filtered_df.columns else filtered_df
        trend = "stable"
        if len(sorted_df) > 1 and 'price_per_sqft' in sorted_df.columns:
            if sorted_df.iloc[-1]['price_per_sqft'] > sorted_df.iloc[0]['price_per_sqft']:
                trend = "growth"
            else:
                trend = "declining"

        summary = generate_mock_summary(target_locality, avg_price, trend)

        return Response({
            "summary": summary,
            "data": data_records,
            "locality": str(target_locality)
        }, status=status.HTTP_200_OK)