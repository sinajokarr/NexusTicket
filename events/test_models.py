import pytest
from .models import Category

@pytest.mark.django_db
def test_create_category():
    cat = Category.objects.create(name="Concert", slug="concert")
    
    assert cat.name == "Concert"
    assert cat.slug == "concert"
    
    assert cat.id is not None