from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import Payment
from orders.models import Order
import uuid
from django.db import transaction

class PaymentRequestView(APIView):
    def post(self, request):
        order_id = request.data.get('order_id')
        order = get_object_or_404(Order, id=order_id, user=request.user, status='pending')

        final_price = order.total_price - order.discount_amount

        payment = Payment.objects.create(
            user=request.user,
            order=order,
            amount=final_price,
            authority_id=uuid.uuid4()
        )

        bank_url = f"http://127.0.0.1:8000/api/payments/mock-bank/{payment.authority_id}/"
        return Response({"payment_url": bank_url})

def mock_bank_view(request, authority_id):
    payment = get_object_or_404(Payment, authority_id=authority_id)
    
    html_content = f"""
    <html>
        <body style="text-align:center; padding:50px; font-family:sans-serif;">
            <h1>🏦 Bank Gateway Simulator</h1>
            <div style="border:1px solid #ccc; padding:20px; width:300px; margin:0 auto;">
                <p>Order ID: <strong>{payment.order.id}</strong></p>
                <p>Amount: <strong style="color:green; font-size:20px;">{payment.amount}$</strong></p>
                <hr>
                <a href="/api/payments/verify/{authority_id}/?status=success" 
                   style="background:green; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
                   ✅ Pay Successfully
                </a>
                <br><br>
                <a href="/api/payments/verify/{authority_id}/?status=failed" 
                   style="background:red; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
                   ❌ Cancel / Fail
                </a>
            </div>
        </body>
    </html>
    """
    return HttpResponse(html_content)

class PaymentVerifyView(APIView):
    def get(self, request, authority_id):
        status_param = request.query_params.get('status')
        payment = get_object_or_404(Payment, authority_id=authority_id)

        if status_param == 'success':
            with transaction.atomic():
                payment.status = 'success'
                payment.transaction_id = f"TRX-{uuid.uuid4().hex[:8]}"
                payment.save()
                
                payment.order.status = 'paid' 
                payment.order.save()
            
            return HttpResponse("<h1 style='color:green; text-align:center;'>✅ Payment Successful! Order Completed.</h1>")
        else:
            payment.status = 'failed'
            payment.save()
            return HttpResponse("<h1 style='color:red; text-align:center;'>❌ Payment Failed. Try again.</h1>")