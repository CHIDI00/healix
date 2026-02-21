from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import VitalSigns, PhysicalData, FitnessData, Nutrition, ReproductiveHealth, Sleep


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')


class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = (
            'id', 'user', 'timestamp',
            'basal_body_temperature', 'blood_glucose', 
            'blood_pressure_systolic', 'blood_pressure_diastolic',
            'body_temperature', 'heart_rate', 'oxygen_saturation',
            'respiratory_rate', 'resting_heart_rate', 'vo2_max'
        )
        read_only_fields = ('id', 'timestamp')


class PhysicalDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalData
        fields = (
            'id', 'user', 'timestamp',
            'basal_metabolic_rate', 'body_fat_percentage', 'bone_mass',
            'height', 'lean_body_mass', 'weight'
        )
        read_only_fields = ('id', 'timestamp')


class FitnessDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FitnessData
        fields = (
            'id', 'user', 'timestamp',
            'active_calories_burned', 'distance', 'elevation_gained',
            'exercise_duration', 'exercise_type', 'floors_climbed',
            'power', 'speed', 'steps', 'steps_cadence',
            'total_calories_burned', 'wheelchair_pushes'
        )
        read_only_fields = ('id', 'timestamp')


class NutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrition
        fields = (
            'id', 'user', 'timestamp',
            'hydration', 'protein', 'carbohydrates', 'fats',
            'calories', 'fiber', 'sodium', 'notes'
        )
        read_only_fields = ('id', 'timestamp')


class ReproductiveHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReproductiveHealth
        fields = (
            'id', 'user', 'timestamp', 'date',
            'cervical_mucus', 'menstruation_flow',
            'menstruation_period_start', 'menstruation_period_end',
            'ovulation_test', 'notes'
        )
        read_only_fields = ('id', 'timestamp')


class SleepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sleep
        fields = (
            'id', 'user', 'timestamp', 'date',
            'sleep_duration', 'sleep_start_time', 'sleep_end_time',
            'sleep_quality', 'deep_sleep_duration', 'light_sleep_duration',
            'rem_sleep_duration', 'awake_duration', 'notes'
        )
        read_only_fields = ('id', 'timestamp')