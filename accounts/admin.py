from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from .models import User

class CustomUserCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('email', 'password')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    ordering = ['email']
    list_display = ['email', 'is_staff', 'is_active']
    search_fields = ['email']
    list_filter = ['is_staff', 'is_active']

    add_form = CustomUserCreationForm

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password'), 
        }),
    )