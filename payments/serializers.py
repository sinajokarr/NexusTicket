from rest_framework import serializers


class PaymentRequestSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(min_value=1)


class DemoPaymentCompletionSerializer(serializers.Serializer):
    outcome = serializers.ChoiceField(choices=('success', 'failed'))
    demo_token = serializers.CharField(required=False, allow_blank=False, max_length=512)
