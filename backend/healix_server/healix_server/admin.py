from django.contrib import admin
from .models import VitalSigns, PhysicalData, FitnessData, Nutrition, ReproductiveHealth, Sleep, EmergencyContact

admin.site.register(VitalSigns)
admin.site.register(PhysicalData)
admin.site.register(FitnessData)
admin.site.register(Nutrition)
admin.site.register(ReproductiveHealth)
admin.site.register(Sleep)
admin.site.register(EmergencyContact)

