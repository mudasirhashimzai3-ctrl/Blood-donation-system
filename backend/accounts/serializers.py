from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError, transaction
from core.models import Permission
from hospitals.models import Hospital
from .models import (
    ROLE_CHOICES,
    PUBLIC_ROLE_NAMES,
    ActivityLog,
    User,
    RolePermission,
    expand_role_names,
    normalize_role_name,
)
# serializers.py


PHONE_NUMBER_ERROR = "Phone number must be exactly 10 digits."


def validate_ten_digit_phone(value):
    phone = (value or "").strip()
    if len(phone) != 10 or not phone.isdigit():
        raise serializers.ValidationError(PHONE_NUMBER_ERROR)
    return phone


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=[("admin", "Admin"), ("donor", "Donor"), ("recipient", "Recipient")])

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        selected_role = attrs.get('role')
        request = self.context.get("request")
        client_platform = ""
        if request is not None:
            client_platform = (request.headers.get("X-Client-Platform", "") or "").lower()

        if username and password and selected_role:
            if client_platform == "mobile" and normalize_role_name(selected_role) == "admin":
                raise serializers.ValidationError('Admin is not supported in the mobile app.')
            user = authenticate(
                request=request,
                username=username,
                password=password
            )
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')

            if normalize_role_name(user.role_name) != normalize_role_name(selected_role):
                raise serializers.ValidationError('Invalid credentials.')
            if client_platform == "mobile" and normalize_role_name(user.role_name) == "admin":
                raise serializers.ValidationError('Admin is not supported in the mobile app.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username, password, and role.')


class SignupSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(max_length=254, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=10, min_length=10)
    donor_blood_group = serializers.ChoiceField(
        choices=[
            ("A+", "A+"),
            ("A-", "A-"),
            ("B+", "B+"),
            ("B-", "B-"),
            ("AB+", "AB+"),
            ("AB-", "AB-"),
            ("O+", "O+"),
            ("O-", "O-"),
        ],
        required=False,
    )
    donor_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    donor_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    donor_age = serializers.IntegerField(min_value=1, max_value=150, required=False)
    donor_date_of_birth = serializers.DateField(required=False, allow_null=True)
    donor_last_donation_date = serializers.DateField(required=False, allow_null=True)
    donor_permanent_address_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    donor_local_address_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    recipient_required_blood_group = serializers.ChoiceField(
        choices=[
            ("A+", "A+"),
            ("A-", "A-"),
            ("B+", "B+"),
            ("B-", "B-"),
            ("AB+", "AB+"),
            ("AB-", "AB-"),
            ("O+", "O+"),
            ("O-", "O-"),
        ],
        required=False,
    )
    recipient_hospital = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        required=False,
        allow_null=True,
    )
    recipient_emergency_level = serializers.ChoiceField(
        choices=[("normal", "Normal"), ("urgent", "Urgent"), ("critical", "Critical")],
        required=False,
        default="normal",
    )
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[("donor", "Donor"), ("recipient", "Recipient")])

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if not value:
            return ""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_phone(self, value):
        return validate_ten_digit_phone(value)

    def validate(self, attrs):
        from donors.models import Donor
        from recipients.models import Recipient

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

        role = normalize_role_name(attrs.get("role"))
        if role == "donor":
            if not attrs.get("donor_blood_group"):
                raise serializers.ValidationError({"donor_blood_group": "Blood group is required for donor signup."})
            donor_latitude = attrs.get("donor_latitude")
            donor_longitude = attrs.get("donor_longitude")
            if donor_latitude is not None and (donor_latitude < -90 or donor_latitude > 90):
                raise serializers.ValidationError({"donor_latitude": "Latitude must be between -90 and 90."})
            if donor_longitude is not None and (donor_longitude < -180 or donor_longitude > 180):
                raise serializers.ValidationError({"donor_longitude": "Longitude must be between -180 and 180."})
            if Donor.objects.filter(
                phone=attrs["phone"],
                deleted_at__isnull=True,
                user__isnull=False,
            ).exists():
                raise serializers.ValidationError({"phone": "A donor profile already exists for this phone number."})
        elif role == "recipient":
            if Recipient.objects.filter(
                phone=attrs["phone"],
                deleted_at__isnull=True,
                user__isnull=False,
            ).exists():
                raise serializers.ValidationError({"phone": "A recipient profile already exists for this phone number."})
        return attrs

    def create(self, validated_data):
        from donors.models import Donor
        from recipients.models import Recipient

        role_name = normalize_role_name(validated_data.pop("role"))
        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password")
        donor_blood_group = validated_data.pop("donor_blood_group", None)
        donor_latitude = validated_data.pop("donor_latitude", None)
        donor_longitude = validated_data.pop("donor_longitude", None)
        donor_age = validated_data.pop("donor_age", None)
        donor_date_of_birth = validated_data.pop("donor_date_of_birth", None)
        donor_last_donation_date = validated_data.pop("donor_last_donation_date", None)
        donor_permanent_address_city = validated_data.pop("donor_permanent_address_city", "")
        donor_local_address_city = validated_data.pop("donor_local_address_city", "")
        recipient_required_blood_group = validated_data.pop("recipient_required_blood_group", None)
        recipient_hospital = validated_data.pop("recipient_hospital", None)
        recipient_emergency_level = validated_data.pop("recipient_emergency_level", "normal")

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    password=password,
                    role_name=role_name,
                    **validated_data,
                )

                if role_name == "donor":
                    donor = Donor.objects.filter(
                        user__isnull=True,
                        phone=user.phone,
                        deleted_at__isnull=True,
                    ).first()
                    if donor:
                        donor.user = user
                        donor.first_name = user.first_name
                        donor.last_name = user.last_name
                        donor.email = user.email or None
                        donor.blood_group = donor_blood_group
                        # Normalize potential legacy null/empty status values.
                        donor.status = "active"
                        if donor_latitude is not None:
                            donor.latitude = donor_latitude
                        if donor_longitude is not None:
                            donor.longitude = donor_longitude
                        if donor_age is not None:
                            donor.age = donor_age
                        if donor_date_of_birth is not None:
                            donor.date_of_birth = donor_date_of_birth
                        if donor_last_donation_date is not None:
                            donor.last_donation_date = donor_last_donation_date
                        donor.permanent_address_city = donor_permanent_address_city or None
                        donor.local_address_city = donor_local_address_city or None
                        update_fields = [
                            "user",
                            "first_name",
                            "last_name",
                            "email",
                            "blood_group",
                            "status",
                            "updated_at",
                        ]
                        if donor_latitude is not None:
                            update_fields.append("latitude")
                        if donor_longitude is not None:
                            update_fields.append("longitude")
                        if donor_age is not None:
                            update_fields.append("age")
                        if donor_date_of_birth is not None:
                            update_fields.append("date_of_birth")
                        if donor_last_donation_date is not None:
                            update_fields.append("last_donation_date")
                        update_fields.extend(["permanent_address_city", "local_address_city"])
                        donor.save(update_fields=update_fields)
                    else:
                        Donor.objects.create(
                            user=user,
                            first_name=user.first_name,
                            last_name=user.last_name,
                            phone=user.phone,
                            email=user.email or None,
                            blood_group=donor_blood_group,
                            status="active",
                            latitude=donor_latitude,
                            longitude=donor_longitude,
                            age=donor_age,
                            date_of_birth=donor_date_of_birth,
                            last_donation_date=donor_last_donation_date,
                            permanent_address_city=donor_permanent_address_city or None,
                            local_address_city=donor_local_address_city or None,
                        )
                elif role_name == "recipient":
                    full_name = f"{user.first_name} {user.last_name}".strip() or user.username
                    recipient = Recipient.objects.filter(
                        user__isnull=True,
                        phone=user.phone,
                        deleted_at__isnull=True,
                    ).first()
                    if recipient:
                        recipient.user = user
                        recipient.full_name = full_name
                        recipient.email = user.email or None
                        recipient.required_blood_group = recipient_required_blood_group
                        recipient.hospital = recipient_hospital
                        recipient.emergency_level = recipient_emergency_level or "normal"
                        recipient.save(
                            update_fields=[
                                "user",
                                "full_name",
                                "email",
                                "required_blood_group",
                                "hospital",
                                "emergency_level",
                                "updated_at",
                            ]
                        )
                    else:
                        Recipient.objects.create(
                            user=user,
                            full_name=full_name,
                            email=user.email or None,
                            phone=user.phone,
                            required_blood_group=recipient_required_blood_group,
                            hospital=recipient_hospital,
                            emergency_level=recipient_emergency_level or "normal",
                        )
                return user
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"detail": "Could not create account profile. Please verify phone/email uniqueness."}
            ) from exc


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for User profile data"""
    permissions = serializers.SerializerMethodField()
    avatarUrl = serializers.SerializerMethodField()
    
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'username', 'email', 'phone',
            'role_name', 'permissions', 'avatarUrl',
            'language_preference', 
            'theme', 'is_active', 'last_login'
        ]
        read_only_fields = ['id', 'last_login']
    

    def get_permissions(self, obj):
        """Get all permissions for this user through roles and direct permissions"""
        if normalize_role_name(obj.role_name) == "admin":
            return [module for module, _ in Permission.MODULES]

        permissions = set()
        
        # Get permissions from role
        if obj.role_name:
            role_permissions = RolePermission.objects.filter(
                role_name__in=expand_role_names([obj.role_name])
            )
            
            for rp in role_permissions:
                permissions.add(rp.permission.module)
        
        # Get direct user permissions
        user_permissions = obj.users_permissions.filter(allow=True).select_related('permission')
        for up in user_permissions:
            permissions.add(up.permission.module)
        
        # Remove denied permissions
        denied_permissions = obj.users_permissions.filter(allow=False).select_related('permission')
        for dp in denied_permissions:
            permissions.discard(dp.permission.module)
        
        return list(permissions)

    def get_avatarUrl(self, obj):
        if not obj.avatar:
            return ""
        request = self.context.get("request")
        url = obj.avatar.url
        return request.build_absolute_uri(url) if request else url

    def validate_phone(self, value):
        if value in (None, ""):
            return value
        return validate_ten_digit_phone(value)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        role = normalize_role_name(data['role_name']) if data['role_name'] else None
        profile_status = 'active'
        if role == 'recipient':
            profile_status = getattr(getattr(instance, 'recipient', None), 'emergency_level', None) or 'normal'
        elif role == 'admin':
            profile_status = 'admin'

        return {
            'id': str(data['id']),
            'firstName': data['first_name'],
            'lastName': data['last_name'],
            'username': data['username'],
            'email': data['email'],
            'phone': data['phone'],
            'role': role,
            'avatarUrl': data['avatarUrl'],
            'profileStatus': profile_status,
            'profile_status': profile_status,
            'permissions': data['permissions'],
            'preferences': {
                'language': data['language_preference'],
                'theme': data['theme']
            }
        }
    
    def update(self, instance, validated_data):
        # Handle role update
        if 'role_name' in validated_data:
            role_name = validated_data.pop('role_name')
            if role_name:
                normalized_role = normalize_role_name(role_name)
                if normalized_role in PUBLIC_ROLE_NAMES:
                    instance.role_name = normalized_role
                else:
                    raise serializers.ValidationError({'role_name': 'Invalid role Name'})
        
        
        return super().update(instance, validated_data)


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for User profile data"""
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name',  'last_name', 'username', 'email', 'phone',
            'role_name',
        ]
    

class CreateUserSerializer(serializers.ModelSerializer):
    """Serializer for creating new users (admin only)"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    send_verification_email = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'username', 'email', 'phone', 'password',
            'role_name', 'send_verification_email'
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_role_name(self, role_name):
        normalized_role = normalize_role_name(role_name)
        if normalized_role == 'admin':
            raise serializers.ValidationError("Invalid Role Name")
        if normalized_role not in {"donor", "recipient"}:
            raise serializers.ValidationError("Invalid Role Name")
        return normalized_role

    def validate_phone(self, value):
        if value in (None, ""):
            return value
        return validate_ten_digit_phone(value)

    def create(self, validated_data):
        import secrets
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.template.loader import render_to_string
        from datetime import datetime
        from django.utils import timezone

        role_name = normalize_role_name(validated_data.pop('role_name'))
        password = validated_data.pop('password')
        send_email = validated_data.pop('send_verification_email', False)

        # Create user
        user = User.objects.create_user(
            password=password,
            role_name=role_name,
            **validated_data
        )

        # Send verification email if requested
        if send_email and user.email:
            token = secrets.token_urlsafe(32)
            user.email_verification_token = token
            user.email_verification_sent_at = timezone.now()
            user.email_verified = False
            user.save(update_fields=['email_verification_token', 'email_verification_sent_at', 'email_verified'])

            # Send verification email
            verification_url = f"{settings.FRONTEND_URL}/mis/auth/verify-email/{token}"
            context = {
                'user': user,
                'verification_url': verification_url,
                'current_year': datetime.now().year
            }

            try:
                html_content = render_to_string('emails/email_verification.html', context)
                text_content = f'Welcome! Click the link below to verify your email:\n\n{verification_url}\n\nThis link will expire in 24 hours.'

                email_msg = EmailMultiAlternatives(
                    subject='Welcome to BDS - Verify Your Email',
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email]
                )
                email_msg.attach_alternative(html_content, "text/html")
                email_msg.send(fail_silently=False)
            except Exception as e:
                # Log the error but don't fail user creation
                print(f"Failed to send verification email: {e}")
        else:
            # Mark email as verified if not sending verification
            user.email_verified = True
            user.save(update_fields=['email_verified'])

        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords do not match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'user_username', 'action',
            'table_name', 'record_id', 'old_values', 'new_values',
            'ip_address', 'user_agent', 'session_id', 'timestamp', 'created_at'
        ]
        read_only_fields = ['created_at', 'user_name', 'user_username']


class ActivityLogCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating activity logs"""

    class Meta:
        model = ActivityLog
        fields = [
            'action', 'table_name', 'record_id', 'old_values',
            'new_values', 'ip_address', 'user_agent', 'session_id'
        ]


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password request - sends verification code"""
    email_or_username = serializers.CharField(required=True)

    def validate_email_or_username(self, value):
        """Check if user exists"""
        user = User.objects.filter(username=value).first() or User.objects.filter(email=value).first()
        if not user:
            raise serializers.ValidationError("No user found with this email or username")
        if not user.is_active:
            raise serializers.ValidationError("This account is deactivated")
        return value


class VerifyResetCodeSerializer(serializers.Serializer):
    """Serializer for verifying the reset code"""
    email_or_username = serializers.CharField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for password reset with verification code"""
    email_or_username = serializers.CharField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    """Serializer for email verification"""
    token = serializers.CharField(required=True)


class ResendVerificationSerializer(serializers.Serializer):
    """Serializer for resending verification email"""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Check if user exists and email not already verified"""
        user = User.objects.filter(email=value).first()
        if not user:
            raise serializers.ValidationError("No user found with this email")
        if user.email_verified:
            raise serializers.ValidationError("Email is already verified")
        return value
