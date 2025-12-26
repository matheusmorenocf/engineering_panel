from django.contrib import admin
from .models import Location, PhysicalControl

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name',)
    filter_horizontal = ('responsibles',)

@admin.register(PhysicalControl)
class PhysicalControlAdmin(admin.ModelAdmin):
    list_display = ('control_id', 'product', 'nf_number', 'location', 'current_responsible')
    search_fields = ('control_id', 'product', 'nf_number')
    readonly_fields = ('control_id', 'movement_history')